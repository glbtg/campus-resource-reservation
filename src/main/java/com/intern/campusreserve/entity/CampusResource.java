package com.intern.campusreserve.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("cr_campus_resource")
public class CampusResource {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long typeId;
    private String name;
    private String campus;
    private String building;
    private String roomNo;
    private Integer capacity;
    private String status;
    private String description;
    private String coverUrl;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
