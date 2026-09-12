package com.intern.campusreserve.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CampusResourceRequest {
    @NotNull(message = "资源类型不能为空")
    private Long typeId;

    @NotBlank(message = "资源名称不能为空")
    private String name;

    private String campus;
    private String building;
    private String roomNo;

    @NotNull(message = "容量不能为空")
    @Min(value = 1, message = "容量至少为 1")
    private Integer capacity;

    /** OPEN / MAINTAIN / DISABLED */
    private String status = "OPEN";
    private String description;
    private String coverUrl;
}
