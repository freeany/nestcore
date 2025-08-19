# 用户管理系统 (User CRUD System)

基于 NestJS 构建的完整用户管理系统，包含用户CRUD、角色管理、权限控制、操作日志等功能。

## 功能特性

### 🔐 认证与授权
- JWT 身份认证
- 基于角色的权限控制 (RBAC)
- 登录/注册功能
- 令牌刷新机制
- 公共路由装饰器

### 👥 用户管理
- 用户 CRUD 操作
- 用户资料管理
- 用户状态管理（激活/禁用）
- 用户角色分配
- 用户统计信息
- 最近活跃用户查询

### 🎭 角色管理
- 角色 CRUD 操作
- 权限分配
- 角色层次结构
- 角色统计信息
- 批量操作

### 📝 操作日志
- 自动记录用户操作
- 操作日志查询
- 操作统计分析
- 系统操作趋势
- 日志清理功能

### 👤 用户资料
- 详细的用户资料管理
- 头像上传
- 个人信息维护
- 资料完整度统计
- 生日提醒功能

### 🛡️ 安全特性
- 密码加密存储
- 请求限流保护
- 输入验证
- CORS 配置
- 环境变量配置

## 技术栈

- **框架**: NestJS 10.x
- **数据库**: MySQL 8.x
- **ORM**: TypeORM
- **认证**: JWT + Passport
- **验证**: class-validator
- **加密**: bcrypt
- **限流**: @nestjs/throttler
- **配置**: @nestjs/config

## 项目结构

```
src/
├── auth/                    # 认证模块
│   ├── decorators/         # 装饰器
│   ├── dto/               # 数据传输对象
│   ├── guards/            # 守卫
│   ├── strategies/        # 认证策略
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── entities/               # 数据库实体
│   ├── user.entity.ts
│   ├── role.entity.ts
│   ├── profile.entity.ts
│   ├── operation-log.entity.ts
│   └── index.ts
├── modules/               # 功能模块
│   ├── user/             # 用户模块
│   ├── role/             # 角色模块
│   ├── profile/          # 资料模块
│   └── operation-log/    # 日志模块
├── app.module.ts         # 主模块
└── main.ts              # 入口文件
```

## 快速开始

### 1. 环境要求

- Node.js >= 18.x
- MySQL >= 8.0
- npm >= 9.x

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制环境配置文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接和其他参数：

```env
# 应用配置
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=user_crud

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# 加密配置
BCRYPT_ROUNDS=10
```

### 4. 数据库设置

创建数据库：

```sql
CREATE DATABASE user_crud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. 启动应用

开发模式：

```bash
npm run start:dev
```

生产模式：

```bash
npm run build
npm run start:prod
```

应用将在 `http://localhost:3000` 启动，API 接口前缀为 `/api/v1`。

## API 接口

### 认证接口

- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `GET /api/v1/auth/profile` - 获取当前用户信息
- `POST /api/v1/auth/refresh` - 刷新令牌
- `POST /api/v1/auth/logout` - 用户登出

### 用户管理

- `GET /api/v1/users` - 获取用户列表
- `POST /api/v1/users` - 创建用户
- `GET /api/v1/users/:id` - 获取用户详情
- `PATCH /api/v1/users/:id` - 更新用户
- `DELETE /api/v1/users/:id` - 删除用户
- `POST /api/v1/users/:id/roles` - 分配角色
- `DELETE /api/v1/users/:id/roles/:roleId` - 移除角色

### 角色管理

- `GET /api/v1/roles` - 获取角色列表
- `POST /api/v1/roles` - 创建角色
- `GET /api/v1/roles/:id` - 获取角色详情
- `PATCH /api/v1/roles/:id` - 更新角色
- `DELETE /api/v1/roles/:id` - 删除角色

### 用户资料

- `GET /api/v1/profiles/me` - 获取当前用户资料
- `POST /api/v1/profiles` - 创建/更新资料
- `PATCH /api/v1/profiles/me` - 更新当前用户资料
- `GET /api/v1/profiles/search` - 搜索用户资料

### 操作日志

- `GET /api/v1/operation-logs` - 获取操作日志
- `GET /api/v1/operation-logs/me` - 获取当前用户日志
- `GET /api/v1/operation-logs/statistics` - 获取日志统计

## 权限说明

系统内置三种角色：

- **admin**: 系统管理员，拥有所有权限
- **manager**: 管理员，可以管理用户和查看日志
- **user**: 普通用户，只能管理自己的信息

## 开发指南

### 代码规范

```bash
# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 测试

```bash
# 单元测试
npm run test

# 测试覆盖率
npm run test:cov

# E2E 测试
npm run test:e2e
```

### 数据库迁移

```bash
# 生成迁移文件
npm run migration:generate -- src/migrations/MigrationName

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t user-crud .

# 运行容器
docker run -p 3000:3000 --env-file .env user-crud
```

### PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 构建项目
npm run build

# 启动应用
pm2 start dist/main.js --name user-crud
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如果您觉得这个项目有用，请给它一个 ⭐️！

## 更新日志

### v1.0.0
- 初始版本发布
- 完整的用户管理功能
- JWT 认证系统
- 角色权限控制
- 操作日志记录
- 用户资料管理
