import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  MaxLength,
} from 'class-validator';

export class CreateOperationLogDto {
  @IsString()
  @IsNotEmpty({ message: '操作类型不能为空' })
  @MaxLength(50, { message: '操作类型长度不能超过50位' })
  action: string;

  @IsString()
  @IsNotEmpty({ message: '操作模块不能为空' })
  @MaxLength(100, { message: '操作模块长度不能超过100位' })
  module: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  oldData?: any;

  @IsOptional()
  newData?: any;

  @IsOptional()
  @IsString()
  @MaxLength(45, { message: 'IP地址长度不能超过45位' })
  ipAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '用户代理长度不能超过500位' })
  userAgent?: string;

  @IsOptional()
  @IsEnum(['SUCCESS', 'FAILED'], { message: '状态必须是SUCCESS或FAILED' })
  status?: string = 'SUCCESS';

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsNumber()
  userId?: number;
}
