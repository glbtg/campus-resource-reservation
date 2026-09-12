package com.intern.campusreserve.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.intern.campusreserve.common.BizException;
import com.intern.campusreserve.common.PageResult;
import com.intern.campusreserve.common.constant.ReservationStatus;
import com.intern.campusreserve.common.constant.ResourceStatus;
import com.intern.campusreserve.common.constant.SlotStatus;
import com.intern.campusreserve.common.constant.UserRole;
import com.intern.campusreserve.dto.ReservationQuery;
import com.intern.campusreserve.entity.CampusResource;
import com.intern.campusreserve.entity.Reservation;
import com.intern.campusreserve.entity.ResourceSlot;
import com.intern.campusreserve.entity.User;
import com.intern.campusreserve.mapper.ReservationMapper;
import com.intern.campusreserve.security.LoginUser;
import com.intern.campusreserve.security.UserContext;
import com.intern.campusreserve.service.CampusResourceService;
import com.intern.campusreserve.service.ReservationService;
import com.intern.campusreserve.service.ResourceSlotService;
import com.intern.campusreserve.service.UserService;
import com.intern.campusreserve.vo.ReservationVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationServiceImpl extends ServiceImpl<ReservationMapper, Reservation> implements ReservationService {
    private final ResourceSlotService resourceSlotService;
    private final CampusResourceService campusResourceService;
    private final UserService userService;
    private final RedissonClient redissonClient;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReservationVO book(Long slotId) {
        LoginUser loginUser = UserContext.get();

        String lockKey = "campus:reservation:slot:" + slotId;
        RLock lock = redissonClient.getLock(lockKey);
        boolean locked = false;
        try {
            locked = lock.tryLock(2, 10, TimeUnit.SECONDS);
            if (!locked) {
                throw new BizException(429, "当前预约人数较多，请稍后再试");
            }

            ResourceSlot slot = resourceSlotService.getById(slotId);
            if (slot == null) {
                throw new BizException(404, "预约时段不存在");
            }
            if (slot.getReserveDate().isBefore(LocalDate.now())) {
                throw new BizException(400, "不能预约过去日期的时段");
            }
            if (!SlotStatus.OPEN.equals(slot.getStatus()) || slot.getRemainCapacity() == null || slot.getRemainCapacity() <= 0) {
                throw new BizException(400, "该时段已约满或已关闭");
            }
            CampusResource resource = campusResourceService.getById(slot.getResourceId());
            if (resource == null || !ResourceStatus.OPEN.equals(resource.getStatus())) {
                throw new BizException(400, "资源不存在或当前不可预约");
            }

            Long exists = lambdaQuery()
                    .eq(Reservation::getUserId, loginUser.getId())
                    .eq(Reservation::getSlotId, slotId)
                    .eq(Reservation::getActiveFlag, 1)
                    .count();
            if (exists > 0) {
                throw new BizException(409, "请勿重复预约同一时段");
            }

            boolean slotUpdated = resourceSlotService.update(new LambdaUpdateWrapper<ResourceSlot>()
                    .eq(ResourceSlot::getId, slotId)
                    .eq(ResourceSlot::getStatus, SlotStatus.OPEN)
                    .gt(ResourceSlot::getRemainCapacity, 0)
                    .setSql("status = IF(remain_capacity - 1 <= 0, 'FULL', 'OPEN')")
                    .setSql("remain_capacity = remain_capacity - 1"));
            if (!slotUpdated) {
                throw new BizException(409, "该时段刚刚被约满，请选择其他时段");
            }

            Reservation reservation = new Reservation();
            reservation.setReservationNo(buildReservationNo(slot));
            reservation.setUserId(loginUser.getId());
            reservation.setResourceId(slot.getResourceId());
            reservation.setSlotId(slotId);
            reservation.setReserveDate(slot.getReserveDate());
            reservation.setStartTime(slot.getStartTime());
            reservation.setEndTime(slot.getEndTime());
            reservation.setStatus(ReservationStatus.BOOKED);
            reservation.setActiveFlag(1);
            save(reservation);

            resourceSlotService.evictSlotListCache(slot.getResourceId(), slot.getReserveDate());
            return toVO(reservation);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BizException(500, "系统繁忙，请稍后再试");
        } catch (DuplicateKeyException e) {
            throw new BizException(409, "请勿重复预约同一时段");
        } finally {
            if (locked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancel(Long reservationId, String reason) {
        LoginUser loginUser = UserContext.get();
        Reservation reservation = getById(reservationId);
        if (reservation == null) {
            throw new BizException(404, "预约记录不存在");
        }
        if (!UserRole.ADMIN.equals(loginUser.getRole()) && !reservation.getUserId().equals(loginUser.getId())) {
            throw new BizException(403, "只能取消自己的预约");
        }
        if (!ReservationStatus.BOOKED.equals(reservation.getStatus())) {
            throw new BizException(400, "当前预约状态不支持取消");
        }

        String lockKey = "campus:reservation:slot:" + reservation.getSlotId();
        RLock lock = redissonClient.getLock(lockKey);
        boolean locked = false;
        try {
            locked = lock.tryLock(2, 10, TimeUnit.SECONDS);
            if (!locked) {
                throw new BizException(429, "系统正在处理该时段预约，请稍后再试");
            }

            reservation.setStatus(ReservationStatus.CANCELLED);
            reservation.setActiveFlag(null);
            reservation.setCancelReason(StringUtils.hasText(reason) ? reason : "用户主动取消");
            updateById(reservation);

            resourceSlotService.update(new LambdaUpdateWrapper<ResourceSlot>()
                    .eq(ResourceSlot::getId, reservation.getSlotId())
                    .ne(ResourceSlot::getStatus, SlotStatus.CLOSED)
                    .set(ResourceSlot::getStatus, SlotStatus.OPEN)
                    .setSql("remain_capacity = remain_capacity + 1"));
            resourceSlotService.evictSlotListCache(reservation.getResourceId(), reservation.getReserveDate());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BizException(500, "系统繁忙，请稍后再试");
        } finally {
            if (locked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    @Override
    public PageResult<ReservationVO> pageMine(ReservationQuery query) {
        LoginUser loginUser = UserContext.get();
        query.setUserId(loginUser.getId());
        return pageQuery(query);
    }

    @Override
    public PageResult<ReservationVO> pageAdmin(ReservationQuery query) {
        return pageQuery(query);
    }

    private PageResult<ReservationVO> pageQuery(ReservationQuery query) {
        Page<Reservation> page = Page.of(query.getCurrent(), query.getSize());
        LambdaQueryWrapper<Reservation> wrapper = new LambdaQueryWrapper<Reservation>()
                .eq(query.getUserId() != null, Reservation::getUserId, query.getUserId())
                .eq(query.getResourceId() != null, Reservation::getResourceId, query.getResourceId())
                .eq(StringUtils.hasText(query.getStatus()), Reservation::getStatus, query.getStatus())
                .ge(query.getStartDate() != null, Reservation::getReserveDate, query.getStartDate())
                .le(query.getEndDate() != null, Reservation::getReserveDate, query.getEndDate())
                .orderByDesc(Reservation::getCreateTime);
        Page<Reservation> result = page(page, wrapper);
        List<ReservationVO> records = result.getRecords().stream().map(this::toVO).toList();
        return PageResult.of(result.getCurrent(), result.getSize(), result.getTotal(), records);
    }

    @Override
    public ReservationVO toVO(Reservation reservation) {
        if (reservation == null) {
            return null;
        }
        ReservationVO vo = new ReservationVO();
        vo.setId(reservation.getId());
        vo.setReservationNo(reservation.getReservationNo());
        vo.setUserId(reservation.getUserId());
        User user = userService.getById(reservation.getUserId());
        if (user != null) {
            vo.setUsername(user.getUsername());
            vo.setNickname(user.getNickname());
        }
        vo.setResourceId(reservation.getResourceId());
        CampusResource resource = campusResourceService.getById(reservation.getResourceId());
        vo.setResourceName(resource == null ? null : resource.getName());
        vo.setSlotId(reservation.getSlotId());
        vo.setReserveDate(reservation.getReserveDate());
        vo.setStartTime(reservation.getStartTime());
        vo.setEndTime(reservation.getEndTime());
        vo.setStatus(reservation.getStatus());
        vo.setCancelReason(reservation.getCancelReason());
        vo.setCreateTime(reservation.getCreateTime());
        return vo;
    }

    private String buildReservationNo(ResourceSlot slot) {
        return "CR" + slot.getReserveDate().format(DateTimeFormatter.BASIC_ISO_DATE)
                + slot.getId()
                + System.currentTimeMillis() % 100000;
    }
}
