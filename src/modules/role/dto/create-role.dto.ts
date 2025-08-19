import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: '角色名称不能为空' })
  @MinLength(2, { message: '角色名称长度不能少于2位' })
  @MaxLength(50, { message: '角色名称长度不能超过50位' })
  name: string;

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
  isActive?: boolean = true;
}
