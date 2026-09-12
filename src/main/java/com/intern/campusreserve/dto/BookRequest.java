package com.intern.campusreserve.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookRequest {
    @NotNull(message = "预约时段 ID 不能为空")
    private Long slotId;
}
