package com.intern.campusreserve.vo;

import lombok.Data;

@Data
public class CampusResourceVO {
    private Long id;
    private Long typeId;
    private String typeName;
    private String name;
    private String campus;
    private String building;
    private String roomNo;
    private Integer capacity;
    private String status;
    private String description;
    private String coverUrl;
}
