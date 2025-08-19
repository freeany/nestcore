import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, Role, Profile, OperationLog } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Profile, OperationLog])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
