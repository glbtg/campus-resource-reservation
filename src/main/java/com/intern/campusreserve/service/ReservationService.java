package com.intern.campusreserve.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.intern.campusreserve.common.PageResult;
import com.intern.campusreserve.dto.ReservationQuery;
import com.intern.campusreserve.entity.Reservation;
import com.intern.campusreserve.vo.ReservationVO;

public interface ReservationService extends IService<Reservation> {
    ReservationVO book(Long slotId);
    void cancel(Long reservationId, String reason);
    PageResult<ReservationVO> pageMine(ReservationQuery query);
    PageResult<ReservationVO> pageAdmin(ReservationQuery query);
    ReservationVO toVO(Reservation reservation);
}
