import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: any,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;
    let details: any = null;

    // 处理不同类型的异常
    if (exception instanceof HttpException) {
      // HTTP异常
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;
        details = responseObj.details || null;
      }
    } else if (exception instanceof QueryFailedError) {
      // 数据库查询异常
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';
      // 处理常见的数据库错误
      if (exception.message.includes('Duplicate entry')) {
        message = '数据已存在，请检查输入信息';
      } else if (exception.message.includes('foreign key constraint')) {
        message = '数据关联错误，无法执行此操作';
      } else if (exception.message.includes('cannot be null')) {
        message = '必填字段不能为空';
      } else {
        message = '数据库操作失败';
      }
      details = {
        query: exception.query,
        parameters: exception.parameters,
      };
    } else {
      // 其他未知异常
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = '服务器内部错误';
      error = 'Internal Server Error';
      if (exception instanceof Error) {
        details = {
          name: exception.name,
          stack: exception.stack,
        };
      }
    }

    // 构建错误响应
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      ...(details && { details }),
    };

    // 记录错误日志
    const logContext = {
      context: 'GlobalExceptionFilter',
      statusCode: status,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.get('User-Agent'),
      userId: (request as any).user?.id || null,
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : null,
    };

    if (status >= 500) {
      // 服务器错误
      this.winstonLogger.error('服务器内部错误', logContext);
      this.logger.error(
        `${request.method} ${request.url} - ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      // 客户端错误
      this.winstonLogger.warn('客户端请求错误', logContext);
      this.logger.warn(
        `${request.method} ${request.url} - ${status}: ${message}`,
      );
    }

    // 返回错误响应
    response.status(status).json(errorResponse);
  }
}
