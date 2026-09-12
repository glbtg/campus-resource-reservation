package com.intern.campusreserve.controller;

import com.intern.campusreserve.common.ApiResult;
import com.intern.campusreserve.common.PageResult;
import com.intern.campusreserve.dto.CampusResourceRequest;
import com.intern.campusreserve.dto.ResourceQuery;
import com.intern.campusreserve.service.CampusResourceService;
import com.intern.campusreserve.vo.CampusResourceVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "校园资源")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/resources")
public class CampusResourceController {
    private final CampusResourceService campusResourceService;

    @Operation(summary = "分页查询资源")
    @GetMapping
    public ApiResult<PageResult<CampusResourceVO>> page(ResourceQuery query) {
        return ApiResult.ok(campusResourceService.pageResources(query));
    }

    @Operation(summary = "资源详情，带 Redis 缓存")
    @GetMapping("/{id}")
    public ApiResult<CampusResourceVO> detail(@PathVariable Long id) {
        return ApiResult.ok(campusResourceService.detail(id));
    }

    @Operation(summary = "新增资源")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ApiResult<CampusResourceVO> create(@Valid @RequestBody CampusResourceRequest request) {
        return ApiResult.ok("创建成功", campusResourceService.create(request));
    }

    @Operation(summary = "修改资源")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ApiResult<CampusResourceVO> update(@PathVariable Long id, @Valid @RequestBody CampusResourceRequest request) {
        return ApiResult.ok("修改成功", campusResourceService.update(id, request));
    }

    @Operation(summary = "修改资源状态")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ApiResult<Void> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest request) {
        campusResourceService.updateStatus(id, request.getStatus());
        return ApiResult.ok();
    }

    @Data
    public static class StatusRequest {
        private String status;
    }
}
