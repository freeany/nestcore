-- 数据库初始化脚本
-- 用于添加测试数据，方便学习和开发使用

-- 删除表（用作重置，按外键依赖顺序删除）
-- DROP TABLE IF EXISTS operation_logs;
-- DROP TABLE IF EXISTS user_roles;
-- DROP TABLE IF EXISTS profiles;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS roles;

-- 清理现有数据（按外键依赖顺序删除）
DELETE FROM operation_logs;
DELETE FROM user_roles;
DELETE FROM profiles;
DELETE FROM users;
DELETE FROM roles;

-- 重置自增ID
ALTER TABLE roles AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE profiles AUTO_INCREMENT = 1;
ALTER TABLE operation_logs AUTO_INCREMENT = 1;

-- 插入角色数据
INSERT INTO roles (id, name, description, permissions, is_active, created_at, updated_at) VALUES
(1, 'admin', '系统管理员', '["user:create", "user:read", "user:update", "user:delete", "role:create", "role:read", "role:update", "role:delete", "profile:create", "profile:read", "profile:update", "profile:delete"]', 1, NOW(), NOW()),
(2, 'user', '普通用户', '["profile:read", "profile:update"]', 1, NOW(), NOW()),
(3, 'moderator', '版主', '["user:read", "profile:read", "profile:update", "role:read"]', 1, NOW(), NOW()),
(4, 'guest', '访客', '["profile:read"]', 1, NOW(), NOW());

-- 插入用户数据
-- 注意：密码是 'password123' 经过bcrypt加密后的结果（10轮加密）
INSERT INTO users (id, username, email, password, is_active, last_login_at, created_at, updated_at) VALUES
(1, 'admin', 'admin@example.com', '$2b$10$xRQ88ram/F86CDvNI5cQtu0.3J86N0ZQka0A6ja2rjjPJor92ZFCS', 1, NOW(), NOW(), NOW()),
(2, 'john_doe', 'john.doe@example.com', '$2b$10$xRQ88ram/F86CDvNI5cQtu0.3J86N0ZQka0A6ja2rjjPJor92ZFCS', 1, NOW(), NOW(), NOW()),
(3, 'jane_smith', 'jane.smith@example.com', '$2b$10$xRQ88ram/F86CDvNI5cQtu0.3J86N0ZQka0A6ja2rjjPJor92ZFCS', 1, NOW(), NOW(), NOW()),
(4, 'mike_wilson', 'mike.wilson@example.com', '$2b$10$xRQ88ram/F86CDvNI5cQtu0.3J86N0ZQka0A6ja2rjjPJor92ZFCS', 1, NULL, NOW(), NOW()),
(5, 'sarah_johnson', 'sarah.johnson@example.com', '$2b$10$xRQ88ram/F86CDvNI5cQtu0.3J86N0ZQka0A6ja2rjjPJor92ZFCS', 0, NULL, NOW(), NOW()),
(6, 'test_user', 'test@example.com', '$2b$10$xRQ88ram/F86CDvNI5cQtu0.3J86N0ZQka0A6ja2rjjPJor92ZFCS', 1, NOW(), NOW(), NOW());

-- 插入用户角色关联数据
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- admin 拥有 admin 角色
(2, 2), -- john_doe 拥有 user 角色
(3, 2), -- jane_smith 拥有 user 角色
(3, 3), -- jane_smith 同时拥有 moderator 角色
(4, 2), -- mike_wilson 拥有 user 角色
(5, 4), -- sarah_johnson 拥有 guest 角色（已禁用用户）
(6, 2); -- test_user 拥有 user 角色

-- 插入用户资料数据
INSERT INTO profiles (id, first_name, last_name, real_name, nickname, phone, birthday, gender, address, bio, avatar, company, position, website, wechat, qq, weibo, user_id, created_at, updated_at) VALUES
(1, 'Admin', 'User', '系统管理员', 'admin', '13800138000', '1990-01-01', 'male', '北京市朝阳区', '系统管理员，负责平台的整体运营和管理', 'https://example.com/avatars/admin.jpg', 'TechCorp', 'System Administrator', 'https://admin.example.com', 'admin_wx', '123456789', 'admin_weibo', 1, NOW(), NOW()),
(2, 'John', 'Doe', '约翰·多伊', 'Johnny', '13800138001', '1985-05-15', 'male', '上海市浦东新区', '全栈开发工程师，热爱编程和技术分享', 'https://example.com/avatars/john.jpg', 'DevStudio', 'Full Stack Developer', 'https://johndoe.dev', 'john_wx', '987654321', 'john_weibo', 2, NOW(), NOW()),
(3, 'Jane', 'Smith', '简·史密斯', 'Janie', '13800138002', '1992-08-22', 'female', '广州市天河区', 'UI/UX设计师，专注于用户体验设计', 'https://example.com/avatars/jane.jpg', 'DesignHub', 'UI/UX Designer', 'https://janesmith.design', 'jane_wx', '456789123', 'jane_weibo', 3, NOW(), NOW()),
(4, 'Mike', 'Wilson', '迈克·威尔逊', 'Mikey', '13800138003', '1988-12-10', 'male', '深圳市南山区', '产品经理，负责产品规划和需求分析', 'https://example.com/avatars/mike.jpg', 'ProductCorp', 'Product Manager', 'https://mikewilson.pm', 'mike_wx', '789123456', 'mike_weibo', 4, NOW(), NOW()),
(5, 'Sarah', 'Johnson', '莎拉·约翰逊', 'Sara', '13800138004', '1995-03-18', 'female', '杭州市西湖区', '数据分析师，专注于业务数据分析', 'https://example.com/avatars/sarah.jpg', 'DataTech', 'Data Analyst', 'https://sarahjohnson.data', 'sarah_wx', '321654987', 'sarah_weibo', 5, NOW(), NOW()),
(6, 'Test', 'User', '测试用户', 'Tester', '13800138005', '2000-06-30', 'other', '成都市锦江区', '测试账号，用于系统功能测试', 'https://example.com/avatars/test.jpg', 'TestLab', 'QA Engineer', 'https://testuser.qa', 'test_wx', '654987321', 'test_weibo', 6, NOW(), NOW());

-- 插入操作日志数据
INSERT INTO operation_logs (id, action, module, description, old_data, new_data, ip_address, user_agent, status, error_message, user_id, created_at) VALUES
(1, 'LOGIN', 'AUTH', '用户登录系统', NULL, '{"username": "admin", "loginTime": "2024-01-15 09:00:00"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'SUCCESS', NULL, 1, '2024-01-15 09:00:00'),
(2, 'CREATE', 'USER', '创建新用户', NULL, '{"username": "john_doe", "email": "john.doe@example.com"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'SUCCESS', NULL, 1, '2024-01-15 09:15:00'),
(3, 'UPDATE', 'PROFILE', '更新用户资料', '{"nickname": "John"}', '{"nickname": "Johnny"}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'SUCCESS', NULL, 2, '2024-01-15 10:30:00'),
(4, 'LOGIN', 'AUTH', '用户登录系统', NULL, '{"username": "jane_smith", "loginTime": "2024-01-15 11:00:00"}', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 'SUCCESS', NULL, 3, '2024-01-15 11:00:00'),
(5, 'CREATE', 'ROLE', '创建新角色', NULL, '{"name": "moderator", "description": "版主"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'SUCCESS', NULL, 1, '2024-01-15 14:20:00'),
(6, 'DELETE', 'USER', '尝试删除用户失败', '{"username": "test_user"}', NULL, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'FAILED', '权限不足，无法删除该用户', 2, '2024-01-15 15:45:00'),
(7, 'UPDATE', 'USER', '更新用户状态', '{"isActive": true}', '{"isActive": false}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'SUCCESS', NULL, 1, '2024-01-15 16:10:00'),
(8, 'LOGIN', 'AUTH', '用户登录系统', NULL, '{"username": "test_user", "loginTime": "2024-01-16 08:30:00"}', '192.168.1.105', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', 'SUCCESS', NULL, 6, '2024-01-16 08:30:00');

-- 自增ID已在文件开头重置

-- 查询验证数据
SELECT '=== 角色数据 ===' as info;
SELECT * FROM roles;

SELECT '=== 用户数据 ===' as info;
SELECT id, username, email, is_active, last_login_at FROM users;

SELECT '=== 用户角色关联 ===' as info;
SELECT ur.user_id, u.username, ur.role_id, r.name as role_name 
FROM user_roles ur 
JOIN users u ON ur.user_id = u.id 
JOIN roles r ON ur.role_id = r.id;

SELECT '=== 用户资料数据 ===' as info;
SELECT id, real_name, nickname, phone, gender, company, position, user_id FROM profiles;

SELECT '=== 操作日志数据 ===' as info;
SELECT id, action, module, description, status, user_id, created_at FROM operation_logs ORDER BY created_at DESC;

-- 使用说明：
-- 1. 默认密码都是 'password123'
-- 2. 管理员账号：admin / password123
-- 3. 普通用户账号：john_doe, jane_smith, mike_wilson, test_user / password123
-- 4. 已禁用账号：sarah_johnson / password123
-- 5. 所有用户的手机号都是虚拟的，仅用于测试
-- 6. 头像链接是示例链接，实际使用时需要替换为真实的图片地址