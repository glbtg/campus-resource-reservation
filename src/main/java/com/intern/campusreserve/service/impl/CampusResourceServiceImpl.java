package com.intern.campusreserve.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intern.campusreserve.common.BizException;
import com.intern.campusreserve.common.PageResult;
import com.intern.campusreserve.dto.CampusResourceRequest;
import com.intern.campusreserve.dto.ResourceQuery;
import com.intern.campusreserve.entity.CampusResource;
import com.intern.campusreserve.entity.ResourceType;
import com.intern.campusreserve.mapper.CampusResourceMapper;
import com.intern.campusreserve.service.CampusResourceService;
import com.intern.campusreserve.service.ResourceTypeService;
import com.intern.campusreserve.vo.CampusResourceVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CampusResourceServiceImpl extends ServiceImpl<CampusResourceMapper, CampusResource> implements CampusResourceService {
    private final ResourceTypeService resourceTypeService;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.cache.resource-detail-minutes:20}")
    private long resourceDetailMinutes;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CampusResourceVO create(CampusResourceRequest request) {
        checkType(request.getTypeId());
        CampusResource resource = new CampusResource();
        fill(resource, request);
        save(resource);
        return toVO(resource);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CampusResourceVO update(Long id, CampusResourceRequest request) {
        CampusResource resource = getById(id);
        if (resource == null) {
            throw new BizException(404, "资源不存在");
        }
        checkType(request.getTypeId());
        fill(resource, request);
        updateById(resource);
        evictCache(id);
        return toVO(resource);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, String status) {
        CampusResource resource = getById(id);
        if (resource == null) {
            throw new BizException(404, "资源不存在");
        }
        resource.setStatus(status);
        updateById(resource);
        evictCache(id);
    }

    @Override
    public CampusResourceVO detail(Long id) {
        String key = "campus:resource:detail:" + id;
        try {
            String json = stringRedisTemplate.opsForValue().get(key);
            if (StringUtils.hasText(json)) {
                return objectMapper.readValue(json, CampusResourceVO.class);
            }
        } catch (Exception e) {
            log.warn("读取资源详情缓存失败 resourceId={}", id, e);
        }

        CampusResource resource = getById(id);
        if (resource == null) {
            throw new BizException(404, "资源不存在");
        }
        CampusResourceVO vo = toVO(resource);
        try {
            stringRedisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(vo), Duration.ofMinutes(resourceDetailMinutes));
        } catch (Exception e) {
            log.warn("写入资源详情缓存失败 resourceId={}", id, e);
        }
        return vo;
    }

    @Override
    public PageResult<CampusResourceVO> pageResources(ResourceQuery query) {
        Page<CampusResource> page = Page.of(query.getCurrent(), query.getSize());
        LambdaQueryWrapper<CampusResource> wrapper = new LambdaQueryWrapper<CampusResource>()
                .eq(query.getTypeId() != null, CampusResource::getTypeId, query.getTypeId())
                .eq(StringUtils.hasText(query.getStatus()), CampusResource::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), q -> q.like(CampusResource::getName, query.getKeyword())
                        .or().like(CampusResource::getBuilding, query.getKeyword())
                        .or().like(CampusResource::getRoomNo, query.getKeyword()))
                .orderByDesc(CampusResource::getId);
        Page<CampusResource> result = page(page, wrapper);
        List<CampusResourceVO> records = result.getRecords().stream().map(this::toVO).toList();
        return PageResult.of(result.getCurrent(), result.getSize(), result.getTotal(), records);
    }

    @Override
    public CampusResourceVO toVO(CampusResource resource) {
        if (resource == null) {
            return null;
        }
        CampusResourceVO vo = new CampusResourceVO();
        vo.setId(resource.getId());
        vo.setTypeId(resource.getTypeId());
        ResourceType type = resourceTypeService.getById(resource.getTypeId());
        vo.setTypeName(type == null ? null : type.getName());
        vo.setName(resource.getName());
        vo.setCampus(resource.getCampus());
        vo.setBuilding(resource.getBuilding());
        vo.setRoomNo(resource.getRoomNo());
        vo.setCapacity(resource.getCapacity());
        vo.setStatus(resource.getStatus());
        vo.setDescription(resource.getDescription());
        vo.setCoverUrl(resource.getCoverUrl());
        return vo;
    }

    @Override
    public void evictCache(Long id) {
        stringRedisTemplate.delete("campus:resource:detail:" + id);
    }

    private void checkType(Long typeId) {
        if (resourceTypeService.getById(typeId) == null) {
            throw new BizException(404, "资源类型不存在");
        }
    }

    private void fill(CampusResource resource, CampusResourceRequest request) {
        resource.setTypeId(request.getTypeId());
        resource.setName(request.getName());
        resource.setCampus(request.getCampus());
        resource.setBuilding(request.getBuilding());
        resource.setRoomNo(request.getRoomNo());
        resource.setCapacity(request.getCapacity());
        resource.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : "OPEN");
        resource.setDescription(request.getDescription());
        resource.setCoverUrl(request.getCoverUrl());
    }
}
