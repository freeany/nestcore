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
    const user = request.user;
    return data ? user[data] : user;
  },
);
