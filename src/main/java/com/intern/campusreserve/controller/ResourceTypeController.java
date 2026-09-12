package com.intern.campusreserve.controller;

import com.intern.campusreserve.common.ApiResult;
import com.intern.campusreserve.dto.ResourceTypeRequest;
import com.intern.campusreserve.service.ResourceTypeService;
import com.intern.campusreserve.vo.ResourceTypeVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "资源类型")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/resource-types")
public class ResourceTypeController {
    private final ResourceTypeService resourceTypeService;

    @Operation(summary = "查询启用的资源类型")
    @GetMapping
    public ApiResult<List<ResourceTypeVO>> list() {
        return ApiResult.ok(resourceTypeService.listEnabled());
    }

    @Operation(summary = "新增资源类型")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ApiResult<ResourceTypeVO> create(@Valid @RequestBody ResourceTypeRequest request) {
        return ApiResult.ok("创建成功", resourceTypeService.create(request));
    }

    @Operation(summary = "修改资源类型")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ApiResult<ResourceTypeVO> update(@PathVariable Long id, @Valid @RequestBody ResourceTypeRequest request) {
        return ApiResult.ok("修改成功", resourceTypeService.update(id, request));
    }
}
