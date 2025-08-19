import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsDateString,
  IsEnum,
  IsPhoneNumber,
  IsUrl,
} from 'class-validator';
import { CreateProfileDto, Gender } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '真实姓名长度不能超过50位' })
  realName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '昵称长度不能超过20位' })
  nickname?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('CN', { message: '请输入有效的手机号码' })
  phone?: string;

  @IsOptional()
  @IsEnum(Gender, { message: '性别必须是 male、female 或 other' })
  gender?: Gender;

  @IsOptional()
  @IsDateString({}, { message: '请输入有效的出生日期' })
  birthday?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '地址长度不能超过100位' })
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '个人简介长度不能超过200位' })
  bio?: string;

  @IsOptional()
  @IsUrl({}, { message: '请输入有效的头像URL' })
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '公司名称长度不能超过50位' })
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '职位名称长度不能超过50位' })
  position?: string;

  @IsOptional()
  @IsUrl({}, { message: '请输入有效的网站URL' })
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '微信号长度不能超过50位' })
  wechat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'QQ号长度不能超过50位' })
  qq?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '微博账号长度不能超过50位' })
  weibo?: string;
}
