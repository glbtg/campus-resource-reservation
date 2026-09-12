USE campus_reservation;

INSERT INTO cr_resource_type (id, name, description, sort, status) VALUES
(1, '自习空间', '图书馆座位、研讨间、自习室等', 1, 1),
(2, '实验室', '学院开放实验室、课程实验室等', 2, 1),
(3, '会议室', '社团、项目组、班级可预约会议空间', 3, 1),
(4, '设备借用', '投影仪、相机、开发板等可借用设备', 4, 1);

INSERT INTO cr_campus_resource (id, type_id, name, campus, building, room_no, capacity, status, description) VALUES
(1, 1, '图书馆三楼静音自习区', '主校区', '图书馆', '3F-A区', 80, 'OPEN', '适合个人自习，需保持安静。'),
(2, 1, '图书馆研讨间 302', '主校区', '图书馆', '302', 8, 'OPEN', '适合小组讨论，可预约投影设备。'),
(3, 2, '软件工程实验室 A101', '主校区', '信息楼', 'A101', 40, 'OPEN', '配备 Linux 服务器和常用开发环境。'),
(4, 3, '大学生活动中心会议室 B201', '主校区', '活动中心', 'B201', 30, 'OPEN', '社团活动、班级会议可预约。'),
(5, 4, '移动投影仪 P-01', '主校区', '教务处', '设备柜01', 1, 'OPEN', '借用后需当天归还。');

INSERT INTO cr_resource_slot (resource_id, reserve_date, start_time, end_time, total_capacity, remain_capacity, status) VALUES
(1, CURRENT_DATE + INTERVAL 1 DAY, '08:00:00', '10:00:00', 80, 80, 'OPEN'),
(1, CURRENT_DATE + INTERVAL 1 DAY, '10:00:00', '12:00:00', 80, 80, 'OPEN'),
(2, CURRENT_DATE + INTERVAL 1 DAY, '14:00:00', '16:00:00', 1, 1, 'OPEN'),
(3, CURRENT_DATE + INTERVAL 2 DAY, '09:00:00', '11:00:00', 40, 40, 'OPEN'),
(4, CURRENT_DATE + INTERVAL 2 DAY, '15:00:00', '17:00:00', 1, 1, 'OPEN'),
(5, CURRENT_DATE + INTERVAL 1 DAY, '09:00:00', '18:00:00', 1, 1, 'OPEN');

-- 默认账号由 DefaultDataInitializer 在应用启动时自动创建：
-- 管理员：admin / 123456
-- 学生：student / 123456
