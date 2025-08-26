import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    // logger.config.ts 中的winstonLogger实例
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // 记录请求开始
    this.winstonLogger.info(`${url}-${method}-HTTP Request Started`, {
      context: 'LoggingInterceptor',
      method,
      url,
      ip,
      userAgent,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const { statusCode } = response;

          // 记录成功响应
          this.winstonLogger.info(`${url}-${method}-HTTP Request Completed`, {
            context: 'LoggingInterceptor',
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            ip,
            userAgent,
          });
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const statusCode = error.status || 500;

          // 记录错误响应
          this.winstonLogger.error(`${url}-${method}-HTTP Request Failed`, {
            context: 'LoggingInterceptor',
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            error: error.message,
            stack: error.stack,
            ip,
            userAgent,
          });
        },
      }),
    );
  }
}
