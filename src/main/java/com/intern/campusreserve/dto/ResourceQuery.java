package com.intern.campusreserve.dto;

import lombok.Data;

@Data
public class ResourceQuery {
    private Long typeId;
    private String keyword;
    private String status;
    private Long current = 1L;
    private Long size = 10L;
}
