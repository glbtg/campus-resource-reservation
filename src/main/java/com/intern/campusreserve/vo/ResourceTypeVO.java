package com.intern.campusreserve.vo;

import lombok.Data;

@Data
public class ResourceTypeVO {
    private Long id;
    private String name;
    private String description;
    private Integer sort;
    private Integer status;
}
