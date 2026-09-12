package com.intern.campusreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class SlotBatchCreateRequest {
    @NotNull(message = "资源 ID 不能为空")
    private Long resourceId;

    @NotEmpty(message = "预约日期不能为空")
    private List<@NotNull LocalDate> reserveDates;

    @NotNull(message = "开始时间不能为空")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @NotNull(message = "结束时间不能为空")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    @NotNull(message = "容量不能为空")
    @Min(value = 1, message = "容量至少为 1")
    private Integer totalCapacity;
}
