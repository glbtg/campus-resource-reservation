package com.intern.campusreserve.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.intern.campusreserve.dto.SlotBatchCreateRequest;
import com.intern.campusreserve.dto.SlotCreateRequest;
import com.intern.campusreserve.dto.SlotQuery;
import com.intern.campusreserve.entity.ResourceSlot;
import com.intern.campusreserve.vo.ResourceSlotVO;

import java.time.LocalDate;
import java.util.List;

public interface ResourceSlotService extends IService<ResourceSlot> {
    ResourceSlotVO create(SlotCreateRequest request);
    int batchCreate(SlotBatchCreateRequest request);
    List<ResourceSlotVO> listSlots(SlotQuery query);
    void close(Long id);
    ResourceSlotVO toVO(ResourceSlot slot);
    void evictSlotListCache(Long resourceId, LocalDate date);
}
