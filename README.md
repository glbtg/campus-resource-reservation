# 校园资源预约管理系统

这是一个面向 Java 后端实习简历的校园资源预约系统，业务由“预约挂号”场景改造为“校园资源预约”场景。项目重点不是堆功能，而是把 **Spring Boot、MyBatis-Plus、MySQL、Redis、Redisson、事务、索引、并发控制、JWT 登录认证** 串成一个能讲清楚的后端项目。

## 1. 项目定位

系统面向学生和管理员两类用户：

- 学生：注册登录、查询资源、查询可预约时段、提交预约、取消预约、查看我的预约记录。
- 管理员：维护资源类型、维护校园资源、创建预约时段、关闭时段、查看全部预约记录。

适合在简历中作为主项目之外的“次项目”，突出后端基础能力和并发预约控制。

## 2. 技术栈

- JDK 17
- Spring Boot 3.3.5
- MyBatis-Plus 3.5.8
- MySQL 8
- Redis 7
- Redisson
- SpringDoc OpenAPI / Swagger UI
- JWT 风格 Token
- Maven

## 3. 核心亮点

### 3.1 Redis 分布式锁解决并发预约冲突

提交预约时，系统会根据 `slotId` 获取 Redisson 锁：

```text
campus:reservation:slot:{slotId}
```

同一时段的多个请求会被串行处理，避免多个线程同时扣减剩余容量。

### 3.2 MySQL 事务保证预约流程一致性

预约流程在一个事务中完成：

1. 校验预约时段是否存在、是否开放、是否还有余量。
2. 校验用户是否已经预约过该时段。
3. 扣减时段剩余容量。
4. 插入预约记录。
5. 清理 Redis 中该资源对应日期的时段缓存。

任何一步失败都会回滚，避免出现“扣了容量但没有预约记录”或“有预约记录但容量没扣”的脏数据。

### 3.3 唯一索引兜底防止重复预约

`cr_reservation` 表使用：

```sql
UNIQUE KEY uk_user_slot_active (user_id, slot_id, active_flag)
```

当预约处于 `BOOKED` 状态时，`active_flag = 1`；取消后置为 `NULL`。MySQL 允许唯一索引中出现多个 `NULL`，因此它既可以限制同一用户重复预约同一时段，也允许取消后再次预约。

### 3.4 Redis 缓存热点资源和时段列表

- 资源详情缓存：`campus:resource:detail:{resourceId}`
- 时段列表缓存：`campus:slot:list:{resourceId}:{date}`

资源修改、预约、取消预约后会主动删除对应缓存，保证数据最终一致。

### 3.5 索引优化

主要索引：

```sql
idx_slot_resource_date_status(resource_id, reserve_date, status)
idx_reservation_user_status_date(user_id, status, reserve_date)
idx_reservation_resource_date(resource_id, reserve_date)
```

对应资源时段查询、我的预约查询、管理员预约记录查询等高频场景。

## 4. 目录结构

```text
campus-resource-reservation
├── pom.xml
├── docker-compose.yml
├── sql
│   ├── schema.sql
│   └── init-data.sql
├── docs
│   ├── API_TEST.http
│   ├── RESUME.md
│   └── OPEN_SOURCE_NOTICE.md
└── src/main/java/com/intern/campusreserve
    ├── controller
    ├── service
    ├── mapper
    ├── entity
    ├── dto
    ├── vo
    ├── security
    ├── config
    └── common
```

## 5. 本地运行

### 5.1 启动 MySQL 和 Redis

项目提供了 `docker-compose.yml`，可以直接启动：

```bash
docker compose up -d
```

它会自动执行：

```text
sql/schema.sql
sql/init-data.sql
```

如果你不用 Docker，也可以手动创建 MySQL 数据库后依次执行这两个 SQL 文件。

### 5.2 IDEA 导入项目

1. 打开 IntelliJ IDEA。
2. 选择 `Open`。
3. 选择本项目根目录 `campus-resource-reservation`。
4. 等待 Maven 依赖下载完成。
5. 运行 `CampusReservationApplication`。

### 5.3 默认账号

应用启动时会自动创建两个账号：

| 角色 | 用户名 | 密码 |
|---|---|---|
| 管理员 | admin | 123456 |
| 学生 | student | 123456 |

### 5.4 Swagger 地址

启动后访问：

```text
http://localhost:8080/swagger-ui.html
```

## 6. 推荐测试流程

1. 使用 `admin / 123456` 登录，获取 Token。
2. 创建资源类型或使用初始化数据。
3. 创建校园资源。
4. 创建预约时段。
5. 使用 `student / 123456` 登录，查询资源和时段。
6. 调用预约接口 `/api/reservations/book`。
7. 重复请求同一个时段，验证重复预约拦截。
8. 并发压测同一个 `slotId`，验证剩余容量不会扣成负数。
9. 取消预约，验证时段余量恢复、预约记录状态更新。

IDEA HTTP Client 测试脚本见：

```text
docs/API_TEST.http
```

## 7. 面试讲法

这个项目可以这样介绍：

> 我做了一个校园资源预约管理系统，主要练习传统后端开发能力。学生可以查询资源和可预约时段，并提交预约；管理员可以维护资源和时段。项目中比较核心的是预约并发控制：我用 Redisson 根据时段 ID 加分布式锁，让同一时段的预约请求串行处理；同时用 MySQL 事务保证扣减时段余量和插入预约记录的一致性；数据库层还加了唯一索引，防止同一用户重复预约同一时段，作为兜底方案。另外，我对资源详情和时段列表做了 Redis 缓存，预约和取消时主动删除缓存，保证最终一致。

## 8. 注意事项

- 这是一个适合实习简历展示的后端项目，默认没有接入前端页面。接口可以通过 Swagger、Apifox、Postman 或 IDEA HTTP Client 测试。
- `application.yml` 中的 MySQL、Redis 密码需要按你的本地环境修改。
- 如果要上传 GitHub，建议把 `app.jwt.secret` 改成环境变量读取。
