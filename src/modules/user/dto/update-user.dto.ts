import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: '用户名长度不能少于3位' })
  @MaxLength(50, { message: '用户名长度不能超过50位' })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @MaxLength(100, { message: '邮箱长度不能超过100位' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: '密码长度不能少于6位' })
  password?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
