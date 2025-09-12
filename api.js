/**
 * NestCore 用户管理系统 API 文档
 * 基于 NestJS 构建的完整用户管理系统
 * 版本: 1.0.0
 */

const API_CONFIG = {
  title: 'NestCore 用户管理系统 API 文档',
  version: '1.0.0',
  description: '基于 NestJS 构建的完整用户管理系统，包含用户CRUD、角色管理、权限控制、操作日志等功能',
  baseUrl: 'http://localhost:3000/api/v1',
  authentication: {
    type: 'Bearer Token (JWT)',
    header: 'Authorization: Bearer <token>',
    note: '除了标记为 public 的接口外，其他接口都需要JWT认证'
  },
  roles: {
    admin: '系统管理员，拥有所有权限',
    manager: '管理员，可以管理用户和查看日志',
    user: '普通用户，只能管理自己的信息'
  }
};

// 认证模块 API
const AUTH_API = {
  baseRoute: '/auth',
  endpoints: {
    // 用户登录
    login: {
      method: 'POST',
      path: '/auth/login',
      summary: '用户登录',
      public: true,
      requestBody: {
        username: 'string (required) - 用户名',
        password: 'string (required, min: 6) - 密码'
      },
      response: {
        message: 'string - 响应消息',
        access_token: 'string - JWT访问令牌',
        user: {
          id: 'number - 用户ID',
          username: 'string - 用户名',
          email: 'string - 邮箱',
          roles: 'string[] - 用户角色列表',
          isActive: 'boolean - 是否激活'
        }
      }
    },
    // 用户注册
    register: {
      method: 'POST',
      path: '/auth/register',
      summary: '用户注册',
      public: true,
      requestBody: {
        username: 'string (required, min: 3, max: 50) - 用户名',
        email: 'string (required, email format, max: 100) - 邮箱',
        password: 'string (required, min: 6, max: 50) - 密码'
      },
      response: {
        message: 'string - 响应消息',
        user: {
          id: 'number - 用户ID',
          username: 'string - 用户名',
          email: 'string - 邮箱'
        }
      }
    },
    // 获取当前用户信息
    profile: {
      method: 'GET',
      path: '/auth/profile',
      summary: '获取当前用户信息',
      roles: ['user', 'manager', 'admin'],
      response: {
        message: 'string - 响应消息',
        data: 'CurrentUserInfo - 当前用户信息'
      }
    },
    // 刷新令牌
    refresh: {
      method: 'POST',
      path: '/auth/refresh',
      summary: '刷新令牌',
      roles: ['user', 'manager', 'admin'],
      response: {
        access_token: 'string - 新的JWT访问令牌'
      }
    },
    // 用户登出
    logout: {
      method: 'POST',
      path: '/auth/logout',
      summary: '用户登出',
      roles: ['user', 'manager', 'admin'],
      response: {
        message: 'string - 响应消息'
      }
    }
  }
};

// 用户模块 API
const USERS_API = {
  baseRoute: '/users',
  endpoints: {
    // 创建用户
    create: {
      method: 'POST',
      path: '/users',
      summary: '创建用户',
      roles: ['admin'],
      requestBody: {
        username: 'string (required, min: 3, max: 50) - 用户名',
        email: 'string (required, email format, max: 100) - 邮箱',
        password: 'string (required, min: 6) - 密码',
        isActive: 'boolean (optional, default: true) - 是否激活'
      },
      response: {
        message: 'string - 响应消息',
        data: 'User - 创建的用户信息'
      }
    },
    // 获取用户列表
    findAll: {
      method: 'GET',
      path: '/users',
      summary: '获取用户列表（分页查询）',
      roles: ['admin', 'manager'],
      queryParams: {
        username: 'string (optional) - 用户名筛选',
        email: 'string (optional) - 邮箱筛选',
        isActive: 'boolean (optional) - 激活状态筛选',
        page: 'number (optional, default: 1, min: 1) - 页码',
        limit: 'number (optional, default: 10, min: 1, max: 100) - 每页数量',
        sortBy: 'string (optional, default: "createdAt") - 排序字段',
        sortOrder: 'string (optional, default: "DESC") - 排序方式 ASC|DESC',
        search: 'string (optional) - 全文搜索'
      },
      response: {
        message: 'string - 响应消息',
        data: 'User[] - 用户列表',
        total: 'number - 总数量',
        page: 'number - 当前页码',
        limit: 'number - 每页数量',
        totalPages: 'number - 总页数'
      }
    },
    // 获取当前用户信息
    me: {
      method: 'GET',
      path: '/users/me',
      summary: '获取当前用户信息',
      roles: ['user', 'manager', 'admin'],
      response: {
        message: 'string - 响应消息',
        data: 'User - 用户详细信息'
      }
    },
    // 根据ID获取用户信息
    findOne: {
      method: 'GET',
      path: '/users/:id',
      summary: '根据ID获取用户信息',
      roles: ['admin', 'manager'],
      pathParams: {
        id: 'number - 用户ID'
      },
      response: {
        message: 'string - 响应消息',
        data: 'User - 用户信息'
      }
    },
    // 更新用户信息
    update: {
      method: 'PATCH',
      path: '/users/:id',
      summary: '更新用户信息',
      roles: ['user', 'manager', 'admin'],
      note: '普通用户只能更新自己的信息',
      pathParams: {
        id: 'number - 用户ID'
      },
      requestBody: {
        username: 'string (optional, min: 3, max: 50) - 用户名',
        email: 'string (optional, email format, max: 100) - 邮箱',
        password: 'string (optional, min: 6) - 密码',
        isActive: 'boolean (optional) - 是否激活'
      },
      response: {
        message: 'string - 响应消息',
        data: 'User - 更新后的用户信息'
      }
    },
    // 删除用户
    remove: {
      method: 'DELETE',
      path: '/users/:id',
      summary: '删除用户',
      roles: ['admin'],
      pathParams: {
        id: 'number - 用户ID'
      },
      response: {
        statusCode: 204,
        message: '用户删除成功'
      }
    },
    // 为用户分配角色
    assignRoles: {
      method: 'POST',
      path: '/users/:id/roles',
      summary: '为用户分配角色',
      roles: ['admin'],
      pathParams: {
        id: 'number - 用户ID'
      },
      requestBody: {
        roleIds: 'number[] - 角色ID列表'
      },
      response: {
        message: 'string - 响应消息',
        data: 'User - 更新后的用户信息'
      }
    },
    // 移除用户角色
    removeRoles: {
      method: 'DELETE',
      path: '/users/:id/roles',
      summary: '移除用户角色',
      roles: ['admin'],
      pathParams: {
        id: 'number - 用户ID'
      },
      requestBody: {
        roleIds: 'number[] - 角色ID列表'
      },
      response: {
        message: 'string - 响应消息',
        data: 'User - 更新后的用户信息'
      }
    }
  }
};

// 角色模块 API
const ROLES_API = {
  baseRoute: '/roles',
  endpoints: {
    // 创建角色
    create: {
      method: 'POST',
      path: '/roles',
      summary: '创建角色',
      roles: ['admin'],
      requestBody: {
        name: 'string (required, min: 2, max: 50) - 角色名称',
        description: 'string (optional, max: 200) - 角色描述',
        permissions: 'string[] (optional) - 权限列表',
        isActive: 'boolean (optional, default: true) - 是否激活'
      },
      response: {
        message: 'string - 响应消息',
        data: 'Role - 创建的角色信息'
      }
    },
    // 获取角色列表
    findAll: {
      method: 'GET',
      path: '/roles',
      summary: '获取角色列表',
      roles: ['admin', 'manager'],
      queryParams: {
        page: 'number (default: 1) - 页码',
        limit: 'number (default: 10) - 每页数量',
        search: 'string (optional) - 搜索关键词'
      },
      response: {
        message: 'string - 响应消息',
        data: 'Role[] - 角色列表',
        total: 'number - 总数量',
        page: 'number - 当前页码',
        limit: 'number - 每页数量',
        totalPages: 'number - 总页数'
      }
    },
    // 根据ID获取角色信息
    findOne: {
      method: 'GET',
      path: '/roles/:id',
      summary: '根据ID获取角色信息',
      roles: ['admin', 'manager'],
      pathParams: {
        id: 'number - 角色ID'
      },
      response: {
        message: 'string - 响应消息',
        data: 'Role - 角色信息'
      }
    },
    // 更新角色信息
    update: {
      method: 'PATCH',
      path: '/roles/:id',
      summary: '更新角色信息',
      roles: ['admin'],
      pathParams: {
        id: 'number - 角色ID'
      },
      requestBody: {
        name: 'string (optional, min: 2, max: 50) - 角色名称',
        description: 'string (optional, max: 200) - 角色描述',
        permissions: 'string[] (optional) - 权限列表',
        isActive: 'boolean (optional) - 是否激活'
      },
      response: {
        message: 'string - 响应消息',
        data: 'Role - 更新后的角色信息'
      }
    },
    // 删除角色
    remove: {
      method: 'DELETE',
      path: '/roles/:id',
      summary: '删除角色',
      roles: ['admin'],
      pathParams: {
        id: 'number - 角色ID'
      },
      response: {
        statusCode: 204,
        message: '角色删除成功'
      }
    }
  }
};

// 用户资料模块 API
const PROFILES_API = {
  baseRoute: '/profiles',
  endpoints: {
    // 创建或更新当前用户资料
    createOrUpdate: {
      method: 'POST',
      path: '/profiles',
      summary: '创建或更新当前用户资料',
      roles: ['user', 'manager', 'admin'],
      requestBody: {
        realName: 'string (optional, max: 50) - 真实姓名',
        nickname: 'string (optional, max: 20) - 昵称',
        phone: 'string (optional, CN phone format) - 手机号码',
        gender: 'enum (optional) - 性别: male|female|other',
        birthday: 'string (optional, ISO date) - 出生日期',
        address: 'string (optional, max: 100) - 地址',
        bio: 'string (optional, max: 200) - 个人简介',
        avatar: 'string (optional, URL format) - 头像URL',
        company: 'string (optional, max: 50) - 公司名称',
        position: 'string (optional, max: 50) - 职位名称',
        website: 'string (optional, URL format) - 个人网站',
        wechat: 'string (optional, max: 50) - 微信号',
        qq: 'string (optional, max: 50) - QQ号',
        weibo: 'string (optional, max: 50) - 微博账号'
      },
      response: {
        message: 'string - 响应消息',
        data: 'Profile - 用户资料信息'
      }
    },
    // 获取当前用户资料
    me: {
      method: 'GET',
      path: '/profiles/me',
      summary: '获取当前用户资料',
      roles: ['user', 'manager', 'admin'],
      response: {
        message: 'string - 响应消息',
        data: 'Profile - 用户资料信息'
      }
    },
    // 根据资料ID获取详情
    findOne: {
      method: 'GET',
      path: '/profiles/:id',
      summary: '根据资料ID获取详情',
      roles: ['user', 'manager', 'admin'],
      note: '只有管理员、经理或本人可以查看',
      pathParams: {
        id: 'number - 资料ID'
      },
      response: {
        message: 'string - 响应消息',
        data: 'Profile - 资料详情'
      }
    },
    // 更新当前用户资料
    updateMe: {
      method: 'PATCH',
      path: '/profiles/me',
      summary: '更新当前用户资料',
      roles: ['user', 'manager', 'admin'],
      requestBody: {
        realName: 'string (optional, max: 50) - 真实姓名',
        nickname: 'string (optional, max: 20) - 昵称',
        phone: 'string (optional, CN phone format) - 手机号码',
        gender: 'enum (optional) - 性别: male|female|other',
        birthday: 'string (optional, ISO date) - 出生日期',
        address: 'string (optional, max: 100) - 地址',
        bio: 'string (optional, max: 200) - 个人简介',
        avatar: 'string (optional, URL format) - 头像URL',
        company: 'string (optional, max: 50) - 公司名称',
        position: 'string (optional, max: 50) - 职位名称',
        website: 'string (optional, URL format) - 个人网站',
        wechat: 'string (optional, max: 50) - 微信号',
        qq: 'string (optional, max: 50) - QQ号',
        weibo: 'string (optional, max: 50) - 微博账号'
      },
      response: {
        message: 'string - 响应消息',
        data: 'Profile - 更新后的用户资料'
      }
    },
    // 删除当前用户资料
    removeMe: {
      method: 'DELETE',
      path: '/profiles/me',
      summary: '删除当前用户资料',
      roles: ['user', 'manager', 'admin'],
      response: {
        statusCode: 204,
        message: '用户资料删除成功'
      }
    }
  }
};

// 操作日志模块 API
const OPERATION_LOGS_API = {
  baseRoute: '/operation-logs',
  endpoints: {
    // 获取操作日志列表
    findAll: {
      method: 'GET',
      path: '/operation-logs',
      summary: '获取操作日志列表',
      roles: ['admin', 'manager'],
      queryParams: {
        action: 'string (optional) - 操作类型',
        module: 'string (optional) - 操作模块',
        userId: 'number (optional) - 用户ID',
        status: 'enum (optional) - 状态: SUCCESS|FAILED',
        startDate: 'string (optional, ISO date) - 开始日期',
        endDate: 'string (optional, ISO date) - 结束日期',
        page: 'number (optional, default: 1, min: 1) - 页码',
        limit: 'number (optional, default: 10, min: 1, max: 100) - 每页数量',
        sortBy: 'string (optional, default: "createdAt") - 排序字段',
        sortOrder: 'enum (optional, default: "DESC") - 排序方式: ASC|DESC'
      },
      response: {
        message: 'string - 响应消息',
        data: 'OperationLog[] - 操作日志列表',
        total: 'number - 总数量',
        page: 'number - 当前页码',
        limit: 'number - 每页数量',
        totalPages: 'number - 总页数'
      }
    },
    // 获取当前用户的操作日志
    myLogs: {
      method: 'GET',
      path: '/operation-logs/my-logs',
      summary: '获取当前用户的操作日志',
      roles: ['user', 'manager', 'admin'],
      queryParams: {
        action: 'string (optional) - 操作类型',
        module: 'string (optional) - 操作模块',
        status: 'enum (optional) - 状态: SUCCESS|FAILED',
        startDate: 'string (optional, ISO date) - 开始日期',
        endDate: 'string (optional, ISO date) - 结束日期',
        page: 'number (optional, default: 1, min: 1) - 页码',
        limit: 'number (optional, default: 10, min: 1, max: 100) - 每页数量',
        sortBy: 'string (optional, default: "createdAt") - 排序字段',
        sortOrder: 'enum (optional, default: "DESC") - 排序方式: ASC|DESC'
      },
      response: {
        message: 'string - 响应消息',
        data: 'OperationLog[] - 个人操作日志列表',
        total: 'number - 总数量',
        page: 'number - 当前页码',
        limit: 'number - 每页数量',
        totalPages: 'number - 总页数'
      }
    },
    // 根据ID获取操作日志详情
    findOne: {
      method: 'GET',
      path: '/operation-logs/:id',
      summary: '根据ID获取操作日志详情',
      roles: ['admin', 'manager'],
      pathParams: {
        id: 'number - 日志ID'
      },
      response: {
        message: 'string - 响应消息',
        data: 'OperationLog - 操作日志详情'
      }
    },
    // 清理过期日志
    cleanup: {
      method: 'DELETE',
      path: '/operation-logs/cleanup',
      summary: '清理过期日志（仅管理员）',
      roles: ['admin'],
      queryParams: {
        days: 'number (default: 90) - 保留天数'
      },
      response: {
        message: 'string - 响应消息',
        data: {
          deletedCount: 'number - 删除数量',
          daysKept: 'number - 保留天数'
        }
      }
    }
  }
};

// 数据模型定义
const DATA_MODELS = {
  User: {
    id: 'number - 用户ID',
    username: 'string - 用户名',
    email: 'string - 邮箱',
    isActive: 'boolean - 是否激活',
    lastLoginAt: 'Date - 最后登录时间',
    createdAt: 'Date - 创建时间',
    updatedAt: 'Date - 更新时间',
    roles: 'Role[] - 用户角色列表',
    profile: 'Profile - 用户资料',
    operationLogs: 'OperationLog[] - 操作日志列表'
  },
  Role: {
    id: 'number - 角色ID',
    name: 'string - 角色名称',
    description: 'string - 角色描述',
    permissions: 'string[] - 权限列表',
    isActive: 'boolean - 是否激活',
    createdAt: 'Date - 创建时间',
    updatedAt: 'Date - 更新时间',
    users: 'User[] - 拥有此角色的用户列表'
  },
  Profile: {
    id: 'number - 资料ID',
    userId: 'number - 用户ID',
    realName: 'string - 真实姓名',
    nickname: 'string - 昵称',
    phone: 'string - 手机号码',
    gender: 'enum - 性别: male|female|other',
    birthday: 'Date - 出生日期',
    address: 'string - 地址',
    bio: 'string - 个人简介',
    avatar: 'string - 头像URL',
    company: 'string - 公司名称',
    position: 'string - 职位名称',
    website: 'string - 个人网站',
    wechat: 'string - 微信号',
    qq: 'string - QQ号',
    weibo: 'string - 微博账号',
    createdAt: 'Date - 创建时间',
    updatedAt: 'Date - 更新时间',
    user: 'User - 关联用户'
  },
  OperationLog: {
    id: 'number - 日志ID',
    action: 'string - 操作类型',
    module: 'string - 操作模块',
    description: 'string - 操作描述',
    oldData: 'any - 操作前的数据',
    newData: 'any - 操作后的数据',
    ipAddress: 'string - IP地址',
    userAgent: 'string - 用户代理',
    status: 'enum - 操作状态: SUCCESS|FAILED',
    errorMessage: 'string - 错误信息',
    createdAt: 'Date - 创建时间',
    userId: 'number - 用户ID',
    user: 'User - 关联用户'
  }
};

// 错误代码定义
const ERROR_CODES = {
  400: 'Bad Request - 请求参数错误',
  401: 'Unauthorized - 未授权，需要登录',
  403: 'Forbidden - 禁止访问，权限不足',
  404: 'Not Found - 资源不存在',
  409: 'Conflict - 资源冲突，如用户名已存在',
  422: 'Unprocessable Entity - 请求参数验证失败',
  429: 'Too Many Requests - 请求过于频繁',
  500: 'Internal Server Error - 服务器内部错误'
};

// 使用说明
const USAGE_NOTES = {
  globalPrefix: '所有API路径都以 /api/v1 为前缀',
  authentication: '除了标记为 public: true 的接口外，其他接口都需要JWT认证',
  authorization: '接口权限基于角色控制，roles字段表示允许访问的角色',
  validation: '所有请求参数都会进行严格的验证，验证失败返回422状态码',
  pagination: '分页查询接口默认返回第1页，每页10条数据',
  cors: 'API支持跨域请求，默认允许 http://localhost:3002',
  rateLimit: 'API有请求频率限制，防止恶意攻击',
  logging: '所有API请求都会被记录到操作日志中'
};

// 导出所有API定义
if (typeof module !== 'undefined' && module.exports) {
  // Node.js 环境
  module.exports = {
    API_CONFIG,
    AUTH_API,
    USERS_API,
    ROLES_API,
    PROFILES_API,
    OPERATION_LOGS_API,
    DATA_MODELS,
    ERROR_CODES,
    USAGE_NOTES
  };
} else {
  // 浏览器环境
  window.NestCoreAPI = {
    API_CONFIG,
    AUTH_API,
    USERS_API,
    ROLES_API,
    PROFILES_API,
    OPERATION_LOGS_API,
    DATA_MODELS,
    ERROR_CODES,
    USAGE_NOTES
  };
}

/**
 * 使用示例：
 * 
 * // 在 Node.js 中使用
 * const { AUTH_API, USERS_API } = require('./api.js');
 * console.log(AUTH_API.endpoints.login);
 * 
 * // 在浏览器中使用
 * console.log(window.NestCoreAPI.AUTH_API.endpoints.login);
 * 
 * // 构建完整的API URL
 * const baseUrl = API_CONFIG.baseUrl;
 * const loginUrl = baseUrl + AUTH_API.endpoints.login.path;
 * console.log(loginUrl); // http://localhost:3000/api/v1/auth/login
 */