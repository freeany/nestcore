import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// 配置常量
import {
  DATABASE_DEFAULTS,
  THROTTLE_DEFAULTS,
  ConfigKeys,
} from './config/constants';
import configuration, { configValidationSchema } from './config/configuration';

// 实体
import { User, Role, Profile, OperationLog } from './entities';

// 模块
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { ProfileModule } from './modules/profile/profile.module';
import { OperationLogModule } from './modules/operation-log/operation-log.module';

// 守卫
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
      validationSchema: configValidationSchema,
    }),

    // 限流模块
    ThrottlerModule.forRoot([
      {
        ttl: THROTTLE_DEFAULTS.TTL,
        limit: THROTTLE_DEFAULTS.LIMIT,
      },
    ]),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get(ConfigKeys.DB_HOST, DATABASE_DEFAULTS.HOST),
        port: configService.get(ConfigKeys.DB_PORT, DATABASE_DEFAULTS.PORT),
        username: configService.get(
          ConfigKeys.DB_USERNAME,
          DATABASE_DEFAULTS.USERNAME,
        ),
        password: configService.get(
          ConfigKeys.DB_PASSWORD,
          DATABASE_DEFAULTS.PASSWORD,
        ),
        database: configService.get(
          ConfigKeys.DB_DATABASE,
          DATABASE_DEFAULTS.DATABASE,
        ),
        entities: [User, Role, Profile, OperationLog],
        synchronize: configService.get(ConfigKeys.NODE_ENV) !== 'production',
        // logging: configService.get(ConfigKeys.NODE_ENV) === 'development',
        logging: false,
        timezone: DATABASE_DEFAULTS.TIMEZONE,
        charset: DATABASE_DEFAULTS.CHARSET,
      }),
      inject: [ConfigService],
    }),

    // 功能模块
    AuthModule,
    UserModule,
    RoleModule,
    ProfileModule,
    OperationLogModule,
  ],
  providers: [
    // 全局守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
