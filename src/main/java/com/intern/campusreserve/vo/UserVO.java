package com.intern.campusreserve.vo;

import lombok.Data;

@Data
public class UserVO {
    private Long id;
    private String username;
    private String nickname;
    private String role;
    private String phone;
    private Integer status;
}
