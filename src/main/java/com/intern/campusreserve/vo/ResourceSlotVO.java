package com.intern.campusreserve.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ResourceSlotVO {
    private Long id;
    private Long resourceId;
    private String resourceName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate reserveDate;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    private Integer totalCapacity;
    private Integer remainCapacity;
    private String status;
}
