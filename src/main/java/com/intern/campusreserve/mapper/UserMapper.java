package com.intern.campusreserve.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.intern.campusreserve.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
