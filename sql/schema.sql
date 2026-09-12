CREATE DATABASE IF NOT EXISTS campus_reservation DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE campus_reservation;

DROP TABLE IF EXISTS cr_reservation;
DROP TABLE IF EXISTS cr_resource_slot;
DROP TABLE IF EXISTS cr_campus_resource;
DROP TABLE IF EXISTS cr_resource_type;
DROP TABLE IF EXISTS cr_user;

CREATE TABLE cr_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(64) NOT NULL COMMENT '登录用户名',
    password VARCHAR(128) NOT NULL COMMENT 'BCrypt密码',
    nickname VARCHAR(64) NOT NULL COMMENT '昵称',
    role VARCHAR(20) NOT NULL COMMENT 'ADMIN/STUDENT',
    phone VARCHAR(32) DEFAULT NULL COMMENT '手机号',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1启用 0禁用',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_username (username),
    KEY idx_user_role_status (role, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE cr_resource_type (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '资源类型ID',
    name VARCHAR(64) NOT NULL COMMENT '类型名称，如自习室、实验室、会议室、设备',
    description VARCHAR(255) DEFAULT NULL,
    sort INT NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_type_name (name),
    KEY idx_type_status_sort (status, sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='校园资源类型表';

CREATE TABLE cr_campus_resource (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '资源ID',
    type_id BIGINT NOT NULL COMMENT '资源类型ID',
    name VARCHAR(128) NOT NULL COMMENT '资源名称',
    campus VARCHAR(64) DEFAULT NULL COMMENT '校区',
    building VARCHAR(64) DEFAULT NULL COMMENT '楼栋',
    room_no VARCHAR(64) DEFAULT NULL COMMENT '房间号/设备编号',
    capacity INT NOT NULL DEFAULT 1 COMMENT '资源容量',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' COMMENT 'OPEN/MAINTAIN/DISABLED',
    description VARCHAR(1000) DEFAULT NULL,
    cover_url VARCHAR(255) DEFAULT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_resource_type_status (type_id, status),
    KEY idx_resource_name (name),
    CONSTRAINT fk_resource_type FOREIGN KEY (type_id) REFERENCES cr_resource_type(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='校园资源表';

CREATE TABLE cr_resource_slot (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '预约时段ID',
    resource_id BIGINT NOT NULL COMMENT '资源ID',
    reserve_date DATE NOT NULL COMMENT '预约日期',
    start_time TIME NOT NULL COMMENT '开始时间',
    end_time TIME NOT NULL COMMENT '结束时间',
    total_capacity INT NOT NULL COMMENT '总容量',
    remain_capacity INT NOT NULL COMMENT '剩余容量',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' COMMENT 'OPEN/FULL/CLOSED',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_resource_time (resource_id, reserve_date, start_time, end_time),
    KEY idx_slot_resource_date_status (resource_id, reserve_date, status),
    KEY idx_slot_date_status (reserve_date, status),
    CONSTRAINT fk_slot_resource FOREIGN KEY (resource_id) REFERENCES cr_campus_resource(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源开放预约时段表';

CREATE TABLE cr_reservation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '预约记录ID',
    reservation_no VARCHAR(64) NOT NULL COMMENT '预约单号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    resource_id BIGINT NOT NULL COMMENT '资源ID',
    slot_id BIGINT NOT NULL COMMENT '时段ID',
    reserve_date DATE NOT NULL COMMENT '预约日期',
    start_time TIME NOT NULL COMMENT '开始时间',
    end_time TIME NOT NULL COMMENT '结束时间',
    status VARCHAR(20) NOT NULL DEFAULT 'BOOKED' COMMENT 'BOOKED/CANCELLED/FINISHED',
    active_flag TINYINT DEFAULT 1 COMMENT 'BOOKED为1，取消/完成后置NULL，用于唯一索引',
    cancel_reason VARCHAR(255) DEFAULT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_reservation_no (reservation_no),
    UNIQUE KEY uk_user_slot_active (user_id, slot_id, active_flag),
    KEY idx_reservation_user_status_date (user_id, status, reserve_date),
    KEY idx_reservation_resource_date (resource_id, reserve_date),
    CONSTRAINT fk_reservation_user FOREIGN KEY (user_id) REFERENCES cr_user(id),
    CONSTRAINT fk_reservation_resource FOREIGN KEY (resource_id) REFERENCES cr_campus_resource(id),
    CONSTRAINT fk_reservation_slot FOREIGN KEY (slot_id) REFERENCES cr_resource_slot(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约记录表';
