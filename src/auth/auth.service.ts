import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../modules/user/user.service';
import { CreateUserDto } from '../modules/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { OperationLogService } from '../modules/operation-log/operation-log.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private operationLogService: OperationLogService,
  ) {}

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto, ip?: string, userAgent?: string) {
    const { username, password, autoLogin, type } = loginDto;
    try {
      // 查找用户（包含角色信息）
      const user = await this.userService.findByUsernameWithRoles(username);
      if (!user) {
        throw new UnauthorizedException('用户名或密码错误');
      }

      // 检查用户是否激活
      if (!user.isActive) {
        throw new UnauthorizedException('账户已被禁用');
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('用户名或密码错误');
      }

      // 更新最后登录时间
      await this.userService.updateLastLoginTime(user.id);

      // 生成JWT令牌
      const payload: JwtPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles?.map((role) => role.name) || [],
      };

      const accessToken = this.jwtService.sign(payload);

      // 记录登录日志
      const loginTypeDesc = type ? `(${type}登录)` : '';
      await this.operationLogService.create({
        action: 'LOGIN',
        module: 'AUTH',
        description: `用户 ${username} 登录成功${loginTypeDesc}`,
        userId: user.id,
        ipAddress: ip,
        userAgent,
        status: 'SUCCESS',
      });

      this.logger.log(`用户 ${username} 登录成功`);

      return {
        code: HttpStatus.OK,
        message: '登录成功',
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles?.map((role) => role.name) || [],
          isActive: user.isActive,
        },
        autoLogin,
        type,
      };
    } catch (error: any) {
      // 记录登录失败日志
      const loginTypeDesc = type ? `(${type}登录)` : '';
      await this.operationLogService.create({
        action: 'LOGIN',
        module: 'AUTH',
        description: `用户 ${username} 登录失败${loginTypeDesc}`,
        ipAddress: ip,
        userAgent,
        status: 'FAILED',
        errorMessage: error.message,
      });

      this.logger.error(`用户 ${username} 登录失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto, ip?: string, userAgent?: string) {
    const { username, email, password } = registerDto;

    try {
      // 检查用户名是否已存在
      const existingUser = await this.userService.findByUsername(username);
      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }

      // 检查邮箱是否已存在
      const existingEmail = await this.userService.findByEmail(email);
      if (existingEmail) {
        throw new ConflictException('邮箱已存在');
      }

      // 加密密码
      // bcrypt 自动生成随机盐值，防止彩虹表攻击
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 创建用户
      const createUserDto: CreateUserDto = {
        username,
        email,
        password: hashedPassword,
      };

      const user = await this.userService.create(createUserDto);

      // 记录注册日志
      await this.operationLogService.create({
        action: 'REGISTER',
        module: 'AUTH',
        description: `新用户 ${username} 注册成功`,
        userId: user.id,
        ipAddress: ip,
        userAgent,
        status: 'SUCCESS',
      });

      this.logger.log(`新用户 ${username} 注册成功`);

      return {
        message: '注册成功',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    } catch (error: any) {
      // 记录注册失败日志
      await this.operationLogService.create({
        action: 'REGISTER',
        module: 'AUTH',
        description: `用户 ${username} 注册失败`,
        ipAddress: ip,
        userAgent,
        status: 'FAILED',
        errorMessage: error.message,
      });

      this.logger.error(`用户 ${username} 注册失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 验证JWT令牌
   */
  validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch {
      throw new UnauthorizedException('令牌无效或已过期');
    }
  }

  /**
   * 刷新令牌
   */
  async refreshToken(userId: number) {
    const user = await this.userService.findByIdWithRoles(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles?.map((role) => role.name) || [],
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
