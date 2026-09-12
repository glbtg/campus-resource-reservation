package com.intern.campusreserve.security;

import com.intern.campusreserve.common.BizException;
import org.springframework.security.core.context.SecurityContextHolder;

public class UserContext {

    public static LoginUser get() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof LoginUser user) {
            return user;
        }
        throw new BizException(401, "登录状态已失效，请重新登录");
    }

    public static Long userId() {
        return get().getId();
    }
}
