import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '角色名称长度不能少于2位' })
  @MaxLength(50, { message: '角色名称长度不能超过50位' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '角色描述长度不能超过200位' })
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
