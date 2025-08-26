import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => {
  // 将角色信息附加到路由处理器或控制器上， 结合roles.guard.ts配合检查当前用户是否有所需权限
  return SetMetadata(ROLES_KEY, roles);
};
