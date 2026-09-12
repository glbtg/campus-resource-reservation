package com.intern.campusreserve.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intern.campusreserve.common.BizException;
import com.intern.campusreserve.common.constant.ResourceStatus;
import com.intern.campusreserve.common.constant.SlotStatus;
import com.intern.campusreserve.dto.SlotBatchCreateRequest;
import com.intern.campusreserve.dto.SlotCreateRequest;
import com.intern.campusreserve.dto.SlotQuery;
import com.intern.campusreserve.entity.CampusResource;
import com.intern.campusreserve.entity.ResourceSlot;
import com.intern.campusreserve.mapper.ResourceSlotMapper;
import com.intern.campusreserve.service.CampusResourceService;
import com.intern.campusreserve.service.ResourceSlotService;
import com.intern.campusreserve.vo.ResourceSlotVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceSlotServiceImpl extends ServiceImpl<ResourceSlotMapper, ResourceSlot> implements ResourceSlotService {
    private final CampusResourceService campusResourceService;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.cache.slot-list-minutes:3}")
    private long slotListMinutes;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ResourceSlotVO create(SlotCreateRequest request) {
        checkSlot(request);
        ResourceSlot slot = new ResourceSlot();
        slot.setResourceId(request.getResourceId());
        slot.setReserveDate(request.getReserveDate());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setTotalCapacity(request.getTotalCapacity());
        slot.setRemainCapacity(request.getTotalCapacity());
        slot.setStatus(SlotStatus.OPEN);
        save(slot);
        evictSlotListCache(slot.getResourceId(), slot.getReserveDate());
        return toVO(slot);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int batchCreate(SlotBatchCreateRequest request) {
        int created = 0;
        for (LocalDate reserveDate : request.getReserveDates()) {
            SlotCreateRequest single = new SlotCreateRequest();
            single.setResourceId(request.getResourceId());
            single.setReserveDate(reserveDate);
            single.setStartTime(request.getStartTime());
            single.setEndTime(request.getEndTime());
            single.setTotalCapacity(request.getTotalCapacity());
            create(single);
            created++;
        }
        return created;
    }

    @Override
    public List<ResourceSlotVO> listSlots(SlotQuery query) {
        boolean canUseCache = query.getResourceId() != null && query.getReserveDate() != null && !StringUtils.hasText(query.getStatus());
        String key = null;
        if (canUseCache) {
            key = slotListKey(query.getResourceId(), query.getReserveDate());
            try {
                String json = stringRedisTemplate.opsForValue().get(key);
                if (StringUtils.hasText(json)) {
                    return objectMapper.readValue(json, new TypeReference<List<ResourceSlotVO>>() {});
                }
            } catch (Exception e) {
                log.warn("读取时段列表缓存失败 resourceId={} date={}", query.getResourceId(), query.getReserveDate(), e);
            }
        }

        LambdaQueryWrapper<ResourceSlot> wrapper = new LambdaQueryWrapper<ResourceSlot>()
                .eq(query.getResourceId() != null, ResourceSlot::getResourceId, query.getResourceId())
                .eq(query.getReserveDate() != null, ResourceSlot::getReserveDate, query.getReserveDate())
                .eq(StringUtils.hasText(query.getStatus()), ResourceSlot::getStatus, query.getStatus())
                .orderByAsc(ResourceSlot::getReserveDate)
                .orderByAsc(ResourceSlot::getStartTime);
        List<ResourceSlotVO> result = list(wrapper).stream().map(this::toVO).toList();
        if (canUseCache) {
            try {
                stringRedisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(result), Duration.ofMinutes(slotListMinutes));
            } catch (Exception e) {
                log.warn("写入时段列表缓存失败 resourceId={} date={}", query.getResourceId(), query.getReserveDate(), e);
            }
        }
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void close(Long id) {
        ResourceSlot slot = getById(id);
        if (slot == null) {
            throw new BizException(404, "预约时段不存在");
        }
        slot.setStatus(SlotStatus.CLOSED);
        updateById(slot);
        evictSlotListCache(slot.getResourceId(), slot.getReserveDate());
    }

    @Override
    public ResourceSlotVO toVO(ResourceSlot slot) {
        if (slot == null) {
            return null;
        }
        ResourceSlotVO vo = new ResourceSlotVO();
        vo.setId(slot.getId());
        vo.setResourceId(slot.getResourceId());
        CampusResource resource = campusResourceService.getById(slot.getResourceId());
        vo.setResourceName(resource == null ? null : resource.getName());
        vo.setReserveDate(slot.getReserveDate());
        vo.setStartTime(slot.getStartTime());
        vo.setEndTime(slot.getEndTime());
        vo.setTotalCapacity(slot.getTotalCapacity());
        vo.setRemainCapacity(slot.getRemainCapacity());
        vo.setStatus(slot.getStatus());
        return vo;
    }

    @Override
    public void evictSlotListCache(Long resourceId, LocalDate date) {
        if (resourceId != null && date != null) {
            stringRedisTemplate.delete(slotListKey(resourceId, date));
        }
    }

    private String slotListKey(Long resourceId, LocalDate date) {
        return "campus:slot:list:" + resourceId + ":" + date;
    }

    private void checkSlot(SlotCreateRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BizException(400, "结束时间必须晚于开始时间");
        }
        CampusResource resource = campusResourceService.getById(request.getResourceId());
        if (resource == null) {
            throw new BizException(404, "资源不存在");
        }
        if (!ResourceStatus.OPEN.equals(resource.getStatus())) {
            throw new BizException(400, "资源不是开放状态，不能创建预约时段");
        }
        if (request.getTotalCapacity() > resource.getCapacity()) {
            throw new BizException(400, "时段容量不能超过资源容量");
        }
        boolean conflict = lambdaQuery()
                .eq(ResourceSlot::getResourceId, request.getResourceId())
                .eq(ResourceSlot::getReserveDate, request.getReserveDate())
                .ne(ResourceSlot::getStatus, SlotStatus.CLOSED)
                .lt(ResourceSlot::getStartTime, request.getEndTime())
                .gt(ResourceSlot::getEndTime, request.getStartTime())
                .exists();
        if (conflict) {
            throw new BizException(409, "该时段与当天已有预约时段冲突，请检查时间区间");
        }
    }
}
