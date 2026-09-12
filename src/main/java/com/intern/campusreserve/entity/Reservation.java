package com.intern.campusreserve.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@TableName("cr_reservation")
public class Reservation {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String reservationNo;
    private Long userId;
    private Long resourceId;
    private Long slotId;
    private LocalDate reserveDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    /** BOOKED 时为 1；取消/完成后置为 NULL，用于 MySQL 唯一索引兜底防重复预约 */
    private Integer activeFlag;
    private String cancelReason;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
