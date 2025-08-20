import * as Joi from 'joi';
import {
  APP_DEFAULTS,
  DATABASE_DEFAULTS,
  JWT_DEFAULTS,
  LOG_DEFAULTS,
  BCRYPT_DEFAULTS,
} from './constants';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default(APP_DEFAULTS.NODE_ENV),
  PORT: Joi.number().default(APP_DEFAULTS.PORT),

  // 数据库配置验证
  DB_TYPE: Joi.string()
    .valid('mysql', 'postgres')
    .default(DATABASE_DEFAULTS.TYPE),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(DATABASE_DEFAULTS.PORT),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  // JWT配置验证
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default(JWT_DEFAULTS.EXPIRES_IN),

  // 加密配置验证
  BCRYPT_ROUNDS: Joi.number().default(BCRYPT_DEFAULTS.ROUNDS),

  // 日志配置验证
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default(LOG_DEFAULTS.LEVEL),
  LOG_DIR: Joi.string().default(LOG_DEFAULTS.DIR),
});

export default () => ({
  port: parseInt(process.env.PORT!, 10) || APP_DEFAULTS.PORT,
  nodeEnv: process.env.NODE_ENV || APP_DEFAULTS.NODE_ENV,

  database: {
    type: process.env.DB_TYPE || DATABASE_DEFAULTS.TYPE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!, 10) || DATABASE_DEFAULTS.PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },

  jwt: {
    secret: process.env.JWT_SECRET || JWT_DEFAULTS.SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || JWT_DEFAULTS.EXPIRES_IN,
  },

  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS!, 10) || BCRYPT_DEFAULTS.ROUNDS,
  },

  logging: {
    level: process.env.LOG_LEVEL || LOG_DEFAULTS.LEVEL,
    dir: process.env.LOG_DIR || LOG_DEFAULTS.DIR,
  },
});
