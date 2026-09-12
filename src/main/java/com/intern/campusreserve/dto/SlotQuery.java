package com.intern.campusreserve.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SlotQuery {
    private Long resourceId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate reserveDate;

    private String status;
}
