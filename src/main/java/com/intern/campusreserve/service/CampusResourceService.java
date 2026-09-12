package com.intern.campusreserve.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.intern.campusreserve.common.PageResult;
import com.intern.campusreserve.dto.CampusResourceRequest;
import com.intern.campusreserve.dto.ResourceQuery;
import com.intern.campusreserve.entity.CampusResource;
import com.intern.campusreserve.vo.CampusResourceVO;

public interface CampusResourceService extends IService<CampusResource> {
    CampusResourceVO create(CampusResourceRequest request);
    CampusResourceVO update(Long id, CampusResourceRequest request);
    void updateStatus(Long id, String status);
    CampusResourceVO detail(Long id);
    PageResult<CampusResourceVO> pageResources(ResourceQuery query);
    CampusResourceVO toVO(CampusResource resource);
    void evictCache(Long id);
}
