package com.intern.campusreserve.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResourceTypeRequest {
    @NotBlank(message = "资源类型名称不能为空")
    private String name;
    private String description;
    private Integer sort = 0;
    private Integer status = 1;
}
