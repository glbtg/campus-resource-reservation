package com.intern.campusreserve.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.intern.campusreserve.common.BizException;
import com.intern.campusreserve.dto.ResourceTypeRequest;
import com.intern.campusreserve.entity.ResourceType;
import com.intern.campusreserve.mapper.ResourceTypeMapper;
import com.intern.campusreserve.service.ResourceTypeService;
import com.intern.campusreserve.vo.ResourceTypeVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResourceTypeServiceImpl extends ServiceImpl<ResourceTypeMapper, ResourceType> implements ResourceTypeService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ResourceTypeVO create(ResourceTypeRequest request) {
        ResourceType type = new ResourceType();
        fill(type, request);
        save(type);
        return toVO(type);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ResourceTypeVO update(Long id, ResourceTypeRequest request) {
        ResourceType type = getById(id);
        if (type == null) {
            throw new BizException(404, "资源类型不存在");
        }
        fill(type, request);
        updateById(type);
        return toVO(type);
    }

    @Override
    public List<ResourceTypeVO> listEnabled() {
        return list(new LambdaQueryWrapper<ResourceType>()
                .eq(ResourceType::getStatus, 1)
                .orderByAsc(ResourceType::getSort)
                .orderByDesc(ResourceType::getId))
                .stream().map(this::toVO).toList();
    }

    @Override
    public ResourceTypeVO toVO(ResourceType type) {
        if (type == null) {
            return null;
        }
        ResourceTypeVO vo = new ResourceTypeVO();
        vo.setId(type.getId());
        vo.setName(type.getName());
        vo.setDescription(type.getDescription());
        vo.setSort(type.getSort());
        vo.setStatus(type.getStatus());
        return vo;
    }

    private void fill(ResourceType type, ResourceTypeRequest request) {
        type.setName(request.getName());
        type.setDescription(request.getDescription());
        type.setSort(request.getSort() == null ? 0 : request.getSort());
        type.setStatus(request.getStatus() == null ? 1 : request.getStatus());
    }
}
