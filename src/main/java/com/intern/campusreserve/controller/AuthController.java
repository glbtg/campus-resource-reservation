package com.intern.campusreserve.controller;

import com.intern.campusreserve.common.ApiResult;
import com.intern.campusreserve.dto.LoginRequest;
import com.intern.campusreserve.dto.RegisterRequest;
import com.intern.campusreserve.service.UserService;
import com.intern.campusreserve.vo.LoginResponse;
import com.intern.campusreserve.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "认证接口")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    @Operation(summary = "学生注册")
    @PostMapping("/register")
    public ApiResult<UserVO> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResult.ok("注册成功", userService.register(request));
    }

    @Operation(summary = "登录")
    @PostMapping("/login")
    public ApiResult<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResult.ok(userService.login(request));
    }

    @Operation(summary = "当前登录用户")
    @GetMapping("/me")
    public ApiResult<UserVO> me() {
        return ApiResult.ok(userService.currentUser());
    }
}
