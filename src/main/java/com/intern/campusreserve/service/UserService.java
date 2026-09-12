package com.intern.campusreserve.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.intern.campusreserve.dto.LoginRequest;
import com.intern.campusreserve.dto.RegisterRequest;
import com.intern.campusreserve.entity.User;
import com.intern.campusreserve.vo.LoginResponse;
import com.intern.campusreserve.vo.UserVO;

public interface UserService extends IService<User> {
    UserVO register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    UserVO currentUser();
    UserVO toVO(User user);
}
