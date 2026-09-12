package com.intern.campusreserve.controller;

import com.intern.campusreserve.common.ApiResult;
import com.intern.campusreserve.dto.SlotBatchCreateRequest;
import com.intern.campusreserve.dto.SlotCreateRequest;
import com.intern.campusreserve.dto.SlotQuery;
import com.intern.campusreserve.service.ResourceSlotService;
import com.intern.campusreserve.vo.ResourceSlotVO;
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

@Tag(name = "预约时段")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/slots")
public class ResourceSlotController {
    private final ResourceSlotService resourceSlotService;

    @Operation(summary = "查询资源预约时段，resourceId + reserveDate 查询会走 Redis 缓存")
    @GetMapping
    public ApiResult<List<ResourceSlotVO>> list(SlotQuery query) {
        return ApiResult.ok(resourceSlotService.listSlots(query));
    }

    @Operation(summary = "新增预约时段")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ApiResult<ResourceSlotVO> create(@Valid @RequestBody SlotCreateRequest request) {
        return ApiResult.ok("创建成功", resourceSlotService.create(request));
    }

    @Operation(summary = "批量创建预约时段")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/batch")
    public ApiResult<Integer> batchCreate(@Valid @RequestBody SlotBatchCreateRequest request) {
        return ApiResult.ok("批量创建成功", resourceSlotService.batchCreate(request));
    }

    @Operation(summary = "关闭预约时段")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/close")
    public ApiResult<Void> close(@PathVariable Long id) {
        resourceSlotService.close(id);
        return ApiResult.ok();
    }
}
