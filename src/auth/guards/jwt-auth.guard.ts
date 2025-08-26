import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 检查是否为公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * 处理验证结果
   * @param err 错误信息
   * @param user 验证通过的用户信息
   * @returns 验证通过的用户信息
   */
  handleRequest<TUser = any>(err: any, user: any): TUser {
    console.log(err, user, '???');

    if (err || !user) {
      throw err || new UnauthorizedException('访问令牌无效或已过期');
    }
    return user as TUser;
  }
}
