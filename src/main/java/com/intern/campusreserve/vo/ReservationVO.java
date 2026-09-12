package com.intern.campusreserve.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class ReservationVO {
    private Long id;
    private String reservationNo;
    private Long userId;
    private String username;
    private String nickname;
    private Long resourceId;
    private String resourceName;
    private Long slotId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate reserveDate;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    private String status;
    private String cancelReason;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}
