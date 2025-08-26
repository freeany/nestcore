import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../modules/user/user.service';

export interface JwtPayload {
  sub: number; // 用户ID
  username: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    protected configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret')!,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: userId } = payload;
    // 验证用户是否存在且处于活跃状态
    const user = await this.userService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    // 返回用户信息，会被添加到request.user中
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles?.map((role) => role.name) || [],
      isActive: user.isActive,
    };
  }
}
