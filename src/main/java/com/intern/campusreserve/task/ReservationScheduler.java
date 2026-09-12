package com.intern.campusreserve.task;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.intern.campusreserve.common.constant.ReservationStatus;
import com.intern.campusreserve.entity.Reservation;
import com.intern.campusreserve.mapper.ReservationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationScheduler {

    private final ReservationMapper reservationMapper;

    @Scheduled(cron = "7 */5 * * * *")
    public void completeExpiredReservations() {
        int updated = reservationMapper.update(null,
                new LambdaUpdateWrapper<Reservation>()
                        .eq(Reservation::getStatus, ReservationStatus.BOOKED)
                        .eq(Reservation::getActiveFlag, 1)
                        .and(w -> w
                                .lt(Reservation::getReserveDate, LocalDate.now())
                                .or(w2 -> w2
                                        .eq(Reservation::getReserveDate, LocalDate.now())
                                        .le(Reservation::getEndTime, LocalTime.now())))
                        .set(Reservation::getStatus, ReservationStatus.FINISHED)
                        .set(Reservation::getActiveFlag, null));

        if (updated > 0) {
            log.info("自动完成 {} 条过期预约", updated);
        }
    }
}
