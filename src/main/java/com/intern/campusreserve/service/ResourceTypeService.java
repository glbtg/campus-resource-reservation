package com.intern.campusreserve.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.intern.campusreserve.dto.ResourceTypeRequest;
import com.intern.campusreserve.entity.ResourceType;
import com.intern.campusreserve.vo.ResourceTypeVO;

import java.util.List;

public interface ResourceTypeService extends IService<ResourceType> {
    ResourceTypeVO create(ResourceTypeRequest request);
    ResourceTypeVO update(Long id, ResourceTypeRequest request);
    List<ResourceTypeVO> listEnabled();
    ResourceTypeVO toVO(ResourceType type);
}
