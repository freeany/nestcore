import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 自动转换数据类型
      whitelist: true, // 只保留 DTO 中定义的属性
      forbidNonWhitelisted: true, // 禁止未定义的属性
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式类型转换
      },
    }),
  );

  // 全局日志拦截器
  // 会自动拦截http请求
  app.useGlobalInterceptors(app.get(LoggingInterceptor));

  // CORS配置
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  // 全局前缀
  app.setGlobalPrefix('api/v1');

  const port: number = configService.get('PORT', 3000);
  await app.listen(port);

  logger.log(`应用程序运行在: http://localhost:${port}`);
  logger.log(`API文档地址: http://localhost:${port}/api/v1`);
}

bootstrap().catch((error) => {
  console.error('应用程序启动失败:', error);
  process.exit(1);
});
