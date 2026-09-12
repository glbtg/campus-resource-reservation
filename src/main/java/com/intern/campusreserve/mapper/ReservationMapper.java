package com.intern.campusreserve.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.intern.campusreserve.entity.Reservation;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ReservationMapper extends BaseMapper<Reservation> {
}
