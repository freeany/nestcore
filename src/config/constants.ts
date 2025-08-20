/**
 * 应用配置常量
 * 用于管理默认配置值，避免硬编码
 */

// 应用默认配置
export const APP_DEFAULTS = {
  PORT: 3000,
  NODE_ENV: 'development',
  CORS_ORIGIN: 'http://localhost:3000',
} as const;

// 数据库默认配置
export const DATABASE_DEFAULTS = {
  TYPE: 'mysql',
  HOST: 'localhost',
  PORT: 3306,
  USERNAME: 'root',
  PASSWORD: 'root',
  DATABASE: 'user_crud',
  CHARSET: 'utf8mb4',
  TIMEZONE: '+08:00',
} as const;

// JWT默认配置
export const JWT_DEFAULTS = {
  SECRET: 'test123',
  EXPIRES_IN: '7d',
} as const;

// 加密默认配置
export const BCRYPT_DEFAULTS = {
  ROUNDS: 10,
} as const;

// 限流默认配置
export const THROTTLE_DEFAULTS = {
  TTL: 60000, // 1分钟
  LIMIT: 100, // 每分钟最多100次请求
} as const;

// 日志默认配置
export const LOG_DEFAULTS = {
  LEVEL: 'info',
  DIR: 'logs',
} as const;

// 配置键枚举
export enum ConfigKeys {
  // 应用配置
  PORT = 'PORT',
  NODE_ENV = 'NODE_ENV',
  CORS_ORIGIN = 'CORS_ORIGIN',

  // 数据库配置
  DB_TYPE = 'DB_TYPE',
  DB_HOST = 'DB_HOST',
  DB_PORT = 'DB_PORT',
  DB_USERNAME = 'DB_USERNAME',
  DB_PASSWORD = 'DB_PASSWORD',
  DB_DATABASE = 'DB_DATABASE',

  // JWT配置
  JWT_SECRET = 'JWT_SECRET',
  JWT_EXPIRES_IN = 'JWT_EXPIRES_IN',

  // 加密配置
  BCRYPT_ROUNDS = 'BCRYPT_ROUNDS',

  // 限流配置
  THROTTLE_TTL = 'THROTTLE_TTL',
  THROTTLE_LIMIT = 'THROTTLE_LIMIT',

  // 日志配置
  LOG_LEVEL = 'LOG_LEVEL',
  LOG_DIR = 'LOG_DIR',
}
