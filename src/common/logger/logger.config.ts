import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// 确保日志目录存在
const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(
    ({
      timestamp,
      level,
      message,
      context,
      trace,
      ...meta
    }: {
      timestamp: string;
      level: string;
      message: string;
      context?: string;
      trace?: string;
      [key: string]: any;
    }) => {
      const logEntry: any = {
        timestamp,
        level,
        context: context || 'Application',
        message,
        ...meta,
      };

      if (trace) {
        logEntry.trace = trace;
      }

      return JSON.stringify(logEntry);
    },
  ),
);

// 控制台日志格式
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    ({
      timestamp,
      level,
      message,
      context,
    }: {
      timestamp: string;
      level: string;
      message: string;
      context?: string;
    }) => {
      const ctx = context ? `[${String(context)}]` : '';
      return `${timestamp} ${level} ${ctx} ${message}`;
    },
  ),
);

/**
 * 当日志文件达到5MB时，会自动创建新文件.
 * 旧文件会被重命名（如app.log.1, app.log.2等）.
 * 超过5个文件时会自动删除最旧的文件。
 */
export const winstonConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // 控制台输出 实时在终端/控制台显示日志
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // 错误日志文件 只记录错误级别的日志
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // 组合日志文件 记录所有级别的日志（info、warn、error等） 提供完整的应用运行历史记录
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // 应用日志文件 记录应用的主要业务逻辑日志
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],

  // 异常处理 记录未捕获的异常（uncaught exceptions）
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],

  // 拒绝处理 记录未处理的Promise拒绝（unhandled promise rejections）
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
    }),
  ],
};
