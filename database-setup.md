# 数据库初始化指南

本文档说明如何使用 `init-data.sql` 脚本来初始化数据库并添加测试数据。

## 前提条件

1. 确保 MySQL 数据库服务正在运行
2. 确保已创建数据库（默认名称：`user_crud`）
3. 确保应用程序至少运行过一次，以便 TypeORM 创建数据表结构

## 使用方法

### 方法一：使用 MySQL 命令行

```bash
# 连接到 MySQL
mysql -u root -p

# 选择数据库
USE user_crud;

# 执行初始化脚本
source init-data.sql;
```

### 方法二：使用 MySQL Workbench 或其他 GUI 工具

1. 打开 MySQL Workbench
2. 连接到数据库
3. 打开 `init-data.sql` 文件
4. 执行脚本

### 方法三：使用命令行直接执行

```bash
mysql -u root -p user_crud < init-data.sql
```

## 测试数据说明

### 用户账号

| 用户名 | 邮箱 | 密码 | 角色 | 状态 | 说明 |
|--------|------|------|------|------|------|
| admin | admin@example.com | password123 | 管理员 | 激活 | 系统管理员账号 |
| john_doe | john.doe@example.com | password123 | 普通用户 | 激活 | 全栈开发工程师 |
| jane_smith | jane.smith@example.com | password123 | 普通用户 + 版主 | 激活 | UI/UX设计师 |
| mike_wilson | mike.wilson@example.com | password123 | 普通用户 | 激活 | 产品经理 |
| sarah_johnson | sarah.johnson@example.com | password123 | 访客 | 禁用 | 数据分析师（已禁用） |
| test_user | test@example.com | password123 | 普通用户 | 激活 | 测试账号 |

### 角色权限

| 角色 | 权限 |
|------|------|
| admin | 所有权限（用户、角色、资料的增删改查） |
| user | 资料读取和更新 |
| moderator | 用户读取、资料读取和更新、角色读取 |
| guest | 仅资料读取 |

### 个人资料

每个用户都有完整的个人资料信息，包括：
- 基本信息（姓名、昵称、电话、生日、性别）
- 地址和个人简介
- 头像链接
- 工作信息（公司、职位）
- 网站和社交媒体账号

### 操作日志

包含各种操作的示例日志：
- 用户登录记录
- 用户创建记录
- 资料更新记录
- 角色创建记录
- 失败操作记录

## 密码说明

所有测试用户的密码都是 `password123`，经过 bcrypt 加密（10轮）。

如果需要生成新的加密密码，可以使用以下 Node.js 代码：

```javascript
const bcrypt = require('bcrypt');
const password = 'your_password';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

## 注意事项

1. **数据清理**：脚本中包含清理现有数据的 SQL 语句，但默认被注释掉了。如需清理数据，请取消注释相关语句。

2. **生产环境**：此脚本仅用于开发和学习环境，请勿在生产环境中使用。

3. **数据安全**：测试数据中的所有个人信息都是虚构的，仅用于演示目的。

4. **自增ID**：脚本末尾包含重置自增ID的语句，可根据需要启用。

## 验证数据

脚本执行完成后，会自动显示插入的数据，包括：
- 角色列表
- 用户列表
- 用户角色关联
- 用户资料
- 操作日志

## 故障排除

### 常见错误

1. **表不存在**：确保应用程序至少运行过一次，让 TypeORM 创建表结构。

2. **外键约束错误**：确保按照脚本中的顺序执行，先插入主表数据，再插入关联表数据。

3. **重复键错误**：如果数据已存在，请先清理数据或修改脚本中的ID值。

### 重新初始化

如需重新初始化数据，可以：

1. 取消注释脚本开头的 DELETE 语句
2. 重新执行脚本

或者直接删除并重新创建数据库：

```sql
DROP DATABASE user_crud;
CREATE DATABASE user_crud;
```

然后重新运行应用程序让 TypeORM 创建表结构，再执行初始化脚本。