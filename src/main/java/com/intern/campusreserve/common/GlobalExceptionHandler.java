package com.intern.campusreserve.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Objects;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    public ApiResult<Void> handleBizException(BizException e) {
        return ApiResult.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ApiResult<Void> handleAccessDenied(AccessDeniedException e) {
        return ApiResult.fail(403, "当前账号没有权限访问该接口");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ApiResult<Void> handleAuth(AuthenticationException e) {
        return ApiResult.fail(401, e.getMessage());
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
    public ApiResult<Void> handleValidException(Exception e) {
        String message = "参数校验失败";
        if (e instanceof MethodArgumentNotValidException validException) {
            message = Objects.requireNonNull(validException.getBindingResult().getFieldError()).getDefaultMessage();
        } else if (e instanceof BindException bindException) {
            message = Objects.requireNonNull(bindException.getBindingResult().getFieldError()).getDefaultMessage();
        }
        return ApiResult.fail(400, message);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ApiResult<Void> handleNotReadable(HttpMessageNotReadableException e) {
        return ApiResult.fail(400, "请求体格式错误，请检查 JSON 字段类型");
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ApiResult<Void> handleDuplicateKey(DuplicateKeyException e) {
        return ApiResult.fail(409, "数据已存在或发生重复预约，请刷新后重试");
    }

    @ExceptionHandler(Exception.class)
    public ApiResult<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return ApiResult.fail(500, "系统繁忙，请稍后再试");
    }
}
