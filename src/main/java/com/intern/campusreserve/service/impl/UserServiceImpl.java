package com.intern.campusreserve.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.intern.campusreserve.common.BizException;
import com.intern.campusreserve.common.constant.UserRole;
import com.intern.campusreserve.dto.LoginRequest;
import com.intern.campusreserve.dto.RegisterRequest;
import com.intern.campusreserve.entity.User;
import com.intern.campusreserve.mapper.UserMapper;
import com.intern.campusreserve.security.JwtTokenUtil;
import com.intern.campusreserve.security.LoginUser;
import com.intern.campusreserve.security.UserContext;
import com.intern.campusreserve.service.UserService;
import com.intern.campusreserve.vo.LoginResponse;
import com.intern.campusreserve.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    private final JwtTokenUtil jwtTokenUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserVO register(RegisterRequest request) {
        Long count = lambdaQuery().eq(User::getUsername, request.getUsername()).count();
        if (count > 0) {
            throw new BizException(409, "用户名已存在");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname());
        user.setPhone(request.getPhone());
        user.setRole(UserRole.STUDENT);
        user.setStatus(1);
        save(user);
        return toVO(user);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = getOne(new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()), false);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BizException(401, "用户名或密码错误");
        }
        if (user.getStatus() == null || user.getStatus() == 0) {
            throw new BizException(403, "账号已被禁用");
        }
        LoginUser loginUser = new LoginUser(user.getId(), user.getUsername(), user.getNickname(), user.getRole());
        return new LoginResponse(jwtTokenUtil.createToken(loginUser), toVO(user));
    }

    @Override
    public UserVO currentUser() {
        return toVO(getById(UserContext.userId()));
    }

    @Override
    public UserVO toVO(User user) {
        if (user == null) {
            return null;
        }
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setRole(user.getRole());
        vo.setPhone(user.getPhone());
        vo.setStatus(user.getStatus());
        return vo;
    }

    public BCryptPasswordEncoder encoder() {
        return passwordEncoder;
    }
}
