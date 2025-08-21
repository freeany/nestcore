import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { CurrentUserInfo } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户登录
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.login(loginDto, ip, userAgent);
  }

  /**
   * 用户注册
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.authService.register(registerDto, ip, userAgent);
  }

  /**
   * 获取当前用户信息
   */
  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: CurrentUserInfo) {
    return {
      message: '获取用户信息成功',
      user,
    };
  }

  /**
   * 刷新令牌
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@CurrentUser('id') userId: number) {
    return this.authService.refreshToken(userId);
  }

  /**
   * 用户登出（客户端处理，服务端记录日志）
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    // 这里可以添加登出日志记录
    return {
      message: '登出成功',
    };
  }
}
