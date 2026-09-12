package com.intern.campusreserve.bootstrap;

import com.intern.campusreserve.common.constant.UserRole;
import com.intern.campusreserve.entity.User;
import com.intern.campusreserve.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DefaultDataInitializer implements ApplicationRunner {
    private final UserService userService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void run(ApplicationArguments args) {
        initUser("admin", "系统管理员", UserRole.ADMIN);
        initUser("student", "测试学生", UserRole.STUDENT);
    }

    private void initUser(String username, String nickname, String role) {
        if (userService.lambdaQuery().eq(User::getUsername, username).count() > 0) {
            return;
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode("123456"));
        user.setNickname(nickname);
        user.setRole(role);
        user.setStatus(1);
        userService.save(user);
        log.info("已初始化默认账号：{} / 123456 / {}", username, role);
    }
}
