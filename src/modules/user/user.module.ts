import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, Role, Profile, OperationLog } from '../../entities';

@Module({
  // 注册TypeORM实体中的Repository，这样该模块内的服务就可以通过依赖注入来实现这些实体进行数据库操作功能
  // 将 User 、 Role 、 Profile 、 OperationLog 四个实体注册到当前模块，自动为每个实体创建对应的Repository
  imports: [TypeOrmModule.forFeature([User, Role, Profile, OperationLog])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
