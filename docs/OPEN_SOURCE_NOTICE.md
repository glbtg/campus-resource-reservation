# 开源项目来源说明

本工程的业务改造方向参考了 GitHub 上的医院门诊预约挂号项目：

- 仓库：`yyzwz/order-register`
- 地址：`https://github.com/yyzwz/order-register`
- 原项目方向：Vue + Spring Boot 医院门诊预约挂号管理系统

本压缩包中的代码是重新组织后的校园资源预约后端工程，重点增强了：

- 校园资源 / 预约时段 / 预约记录业务模型
- Redisson 分布式锁
- MySQL 事务控制
- 唯一索引防重复预约
- Redis 资源详情和时段列表缓存
- JWT 风格登录认证
- 面向实习简历的 README、SQL 和接口测试脚本

如果你后续直接复制、合并或发布原仓库代码，请注意遵守原仓库许可证要求，并保留来源说明。
