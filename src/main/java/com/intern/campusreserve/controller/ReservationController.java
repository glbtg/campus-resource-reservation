package com.intern.campusreserve.controller;

import com.intern.campusreserve.common.ApiResult;
import com.intern.campusreserve.common.PageResult;
import com.intern.campusreserve.dto.BookRequest;
import com.intern.campusreserve.dto.CancelRequest;
import com.intern.campusreserve.dto.ReservationQuery;
import com.intern.campusreserve.service.ReservationService;
import com.intern.campusreserve.vo.ReservationVO;
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

@Tag(name = "预约记录")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservations")
public class ReservationController {
    private final ReservationService reservationService;

    @Operation(summary = "提交预约：Redisson 分布式锁 + MySQL 事务 + 唯一索引兜底")
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/book")
    public ApiResult<ReservationVO> book(@Valid @RequestBody BookRequest request) {
        return ApiResult.ok("预约成功", reservationService.book(request.getSlotId()));
    }

    @Operation(summary = "取消预约")
    @PutMapping("/{id}/cancel")
    public ApiResult<Void> cancel(@PathVariable Long id, @RequestBody(required = false) CancelRequest request) {
        reservationService.cancel(id, request == null ? null : request.getReason());
        return ApiResult.ok();
    }

    @Operation(summary = "我的预约记录")
    @GetMapping("/mine")
    public ApiResult<PageResult<ReservationVO>> mine(ReservationQuery query) {
        return ApiResult.ok(reservationService.pageMine(query));
    }

    @Operation(summary = "管理员分页查询预约记录")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ApiResult<PageResult<ReservationVO>> adminPage(ReservationQuery query) {
        return ApiResult.ok(reservationService.pageAdmin(query));
    }
}
