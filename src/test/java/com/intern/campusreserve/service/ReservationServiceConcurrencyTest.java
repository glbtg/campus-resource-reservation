package com.intern.campusreserve.service;

import com.intern.campusreserve.common.BizException;
import com.intern.campusreserve.common.constant.ResourceStatus;
import com.intern.campusreserve.entity.CampusResource;
import com.intern.campusreserve.entity.Reservation;
import com.intern.campusreserve.entity.ResourceSlot;
import com.intern.campusreserve.entity.User;
import com.intern.campusreserve.mapper.CampusResourceMapper;
import com.intern.campusreserve.mapper.ReservationMapper;
import com.intern.campusreserve.mapper.ResourceSlotMapper;
import com.intern.campusreserve.mapper.UserMapper;
import com.intern.campusreserve.security.LoginUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ReservationServiceConcurrencyTest {

    @Autowired
    private ReservationService reservationService;
    @Autowired
    private ReservationMapper reservationMapper;
    @Autowired
    private ResourceSlotMapper slotMapper;
    @Autowired
    private CampusResourceMapper resourceMapper;
    @Autowired
    private UserMapper userMapper;

    private final List<Long> createdUserIds = new ArrayList<>();
    private Long testResourceId;
    private Long testSlotId;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setUsername("test_user_" + System.nanoTime());
        user.setPassword("$2a$10$dummy");
        user.setNickname("并发测试用户");
        user.setRole("STUDENT");
        user.setStatus(1);
        userMapper.insert(user);
        createdUserIds.add(user.getId());

        CampusResource resource = new CampusResource();
        resource.setName("测试资源_" + System.nanoTime());
        resource.setTypeId(1L);
        resource.setStatus(ResourceStatus.OPEN);
        resource.setCampus("测试校区");
        resource.setBuilding("测试楼");
        resource.setDescription("并发测试用");
        resource.setCapacity(10);
        resourceMapper.insert(resource);
        testResourceId = resource.getId();

        ResourceSlot slot = new ResourceSlot();
        slot.setResourceId(testResourceId);
        slot.setReserveDate(LocalDate.now().plusDays(7));
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        slot.setTotalCapacity(3);
        slot.setRemainCapacity(3);
        slot.setStatus("OPEN");
        slotMapper.insert(slot);
        testSlotId = slot.getId();
    }

    @AfterEach
    void tearDown() {
        reservationMapper.delete(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Reservation>()
                .eq(Reservation::getSlotId, testSlotId));
        slotMapper.deleteById(testSlotId);
        resourceMapper.deleteById(testResourceId);
        for (Long uid : createdUserIds) {
            userMapper.deleteById(uid);
        }
    }

    @Test
    void sameUserConcurrentBooking_shouldAllowOnlyOne() throws Exception {
        int threadCount = 5;
        LoginUser loginUser = loginUser(createdUserIds.get(0));
        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger duplicateCount = new AtomicInteger();
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                setAuth(loginUser);
                readyLatch.countDown();
                try {
                    startLatch.await();
                    reservationService.book(testSlotId);
                    successCount.incrementAndGet();
                } catch (BizException e) {
                    if (e.getMessage() != null && e.getMessage().contains("重复")) {
                        duplicateCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    // unexpected
                } finally {
                    SecurityContextHolder.clearContext();
                }
            }));
        }

        readyLatch.await();
        startLatch.countDown();

        for (Future<?> f : futures) {
            f.get();
        }
        executor.shutdown();

        assertEquals(1, successCount.get(), "同一用户同时只能有一个预约成功");
        assertEquals(threadCount - 1, duplicateCount.get(), "其余请求应因重复预约被拒绝");
    }

    @Test
    void multiUserConcurrentBooking_shouldNotExceedCapacity() throws Exception {
        int userCount = 8;
        int slotCapacity = 3;

        String baseUsername = "multi_test_" + System.nanoTime();
        for (int i = 0; i < userCount; i++) {
            User u = new User();
            u.setUsername(baseUsername + "_" + i);
            u.setPassword("$2a$10$dummy");
            u.setNickname("并发用户" + i);
            u.setRole("STUDENT");
            u.setStatus(1);
            userMapper.insert(u);
            createdUserIds.add(u.getId());
        }

        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger fullCount = new AtomicInteger();
        CountDownLatch readyLatch = new CountDownLatch(userCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(userCount);
        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < userCount; i++) {
            final int idx = i;
            futures.add(executor.submit(() -> {
                setAuth(loginUser(createdUserIds.get(idx)));
                readyLatch.countDown();
                try {
                    startLatch.await();
                    reservationService.book(testSlotId);
                    successCount.incrementAndGet();
                } catch (BizException e) {
                    if (e.getMessage() != null && (e.getMessage().contains("约满") || e.getMessage().contains("刚刚"))) {
                        fullCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    // unexpected
                } finally {
                    SecurityContextHolder.clearContext();
                }
            }));
        }

        readyLatch.await();
        startLatch.countDown();

        for (Future<?> f : futures) {
            f.get();
        }
        executor.shutdown();

        assertEquals(slotCapacity, successCount.get(), "只有容量数量的人能预约成功");
        assertEquals(userCount - slotCapacity, fullCount.get(), "其余应因已满被拒绝");

        ResourceSlot slot = slotMapper.selectById(testSlotId);
        assertEquals(0, slot.getRemainCapacity(), "剩余容量应为 0");
    }

    @Test
    void highContentionSingleSpot_shouldResultInExactlyOneBooking() throws Exception {
        int contenderCount = 20;
        String baseUsername = "contend_" + System.nanoTime();
        for (int i = 0; i < contenderCount; i++) {
            User u = new User();
            u.setUsername(baseUsername + "_" + i);
            u.setPassword("$2a$10$dummy");
            u.setNickname("竞争用户" + i);
            u.setRole("STUDENT");
            u.setStatus(1);
            userMapper.insert(u);
            createdUserIds.add(u.getId());
        }

        ResourceSlot singleSlot = new ResourceSlot();
        singleSlot.setResourceId(testResourceId);
        singleSlot.setReserveDate(LocalDate.now().plusDays(8));
        singleSlot.setStartTime(LocalTime.of(14, 0));
        singleSlot.setEndTime(LocalTime.of(15, 0));
        singleSlot.setTotalCapacity(1);
        singleSlot.setRemainCapacity(1);
        singleSlot.setStatus("OPEN");
        slotMapper.insert(singleSlot);
        Long singleSlotId = singleSlot.getId();

        AtomicInteger successCount = new AtomicInteger();
        CountDownLatch readyLatch = new CountDownLatch(contenderCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(contenderCount);
        List<Future<?>> futures = new ArrayList<>();

        try {
            for (int i = 0; i < contenderCount; i++) {
                final int idx = i;
                futures.add(executor.submit(() -> {
                    setAuth(loginUser(createdUserIds.get(idx)));
                    readyLatch.countDown();
                    try {
                        startLatch.await();
                        reservationService.book(singleSlotId);
                        successCount.incrementAndGet();
                    } catch (BizException | org.springframework.dao.DuplicateKeyException e) {
                        // expected for losers
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        SecurityContextHolder.clearContext();
                    }
                }));
            }

            readyLatch.await();
            startLatch.countDown();

            for (Future<?> f : futures) {
                f.get();
            }

            assertEquals(1, successCount.get(), "高并发下只有一人能抢到唯一名额");
        } finally {
            executor.shutdown();
            reservationMapper.delete(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Reservation>()
                    .eq(Reservation::getSlotId, singleSlotId));
            slotMapper.deleteById(singleSlotId);
        }
    }

    private LoginUser loginUser(Long userId) {
        User u = userMapper.selectById(userId);
        LoginUser loginUser = new LoginUser();
        loginUser.setId(u.getId());
        loginUser.setUsername(u.getUsername());
        loginUser.setNickname(u.getNickname());
        loginUser.setRole(u.getRole());
        return loginUser;
    }

    private void setAuth(LoginUser loginUser) {
        String role = "STUDENT".equals(loginUser.getRole()) ? "ROLE_STUDENT" : "ROLE_ADMIN";
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                loginUser, null, Collections.singletonList(new SimpleGrantedAuthority(role)));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
