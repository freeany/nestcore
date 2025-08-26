import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserInfo {
  id: number;
  username: string;
  email: string;
  roles: string[];
  isActive: boolean;
}

interface RequestWithUser {
  user: CurrentUserInfo;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof CurrentUserInfo | undefined,
    ctx: ExecutionContext,
  ): CurrentUserInfo | CurrentUserInfo[keyof CurrentUserInfo] => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    // 重要：这里的user是jwt.strategy.ts中validate方法返回的，passprotModule在req对象上添加的用户信息
    const user = request.user;
    return data ? user[data] : user;
  },
);
