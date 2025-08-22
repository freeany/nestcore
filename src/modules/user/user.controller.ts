import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import {
  CurrentUser,
  type CurrentUserInfo,
} from '../../auth/decorators/current-user.decorator';

@Controller('users')
// app.module中provide的守卫(服务)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  // user.module中provide的UserService, 在构造器中注入
  constructor(private readonly userService: UserService) {}

  /**
   * 创建用户（仅管理员）
   */
  @Post()
  // RolesGuard会检查当前方法是否有@Roles装饰器, 并检查@Roles中参数是否包含当前用户的角色
  // 这里的'admin'表示只有管理员角色才能访问这个接口
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      message: '创建用户成功',
      data: user,
    };
  }

  /**
   * 获取用户列表（分页查询）
   */
  @Get()
  @Roles('admin', 'manager')
  /**
   * 如果想局部校验
   * import { ValidationPipe } from '@nestjs/common';
    @UsePipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }))
    async findAll(@Query() queryDto: QueryUserDto) {
      // ...
    }
   */
  async findAll(@Query() queryDto: QueryUserDto) {
    const result = await this.userService.findAll(queryDto);
    return {
      message: '获取用户列表成功',
      ...result,
    };
  }

  /**
   * 获取当前用户信息
   */
  @Get('me')
  async getProfile(@CurrentUser() user: CurrentUserInfo) {
    const userDetails = await this.userService.findById(user.id);
    return {
      message: '获取用户信息成功',
      data: userDetails,
    };
  }

  /**
   * 获取用户详细信息（包含统计数据）
   */
  @Get(':id/details')
  @Roles('admin', 'manager')
  // 对id参数进行处理
  async getUserDetails(@Param('id', ParseIntPipe) id: number) {
    const details = await this.userService.getUserDetails(id);
    return {
      message: '获取用户详细信息成功',
      data: details,
    };
  }

  /**
   * 获取用户操作日志
   */
  @Get(':id/logs')
  @Roles('admin', 'manager')
  async getUserLogs(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    const logs = await this.userService.getUserOperationLogs(id, page, limit);
    return {
      message: '获取用户操作日志成功',
      ...logs,
    };
  }

  /**
   * 获取用户统计信息
   */
  @Get(':id/statistics')
  @Roles('admin', 'manager')
  async getUserStatistics(@Param('id', ParseIntPipe) id: number) {
    const statistics = await this.userService.getUserStatistics(id);
    return {
      message: '获取用户统计信息成功',
      data: statistics,
    };
  }

  /**
   * 根据角色查找用户
   */
  @Get('by-role/:roleName')
  @Roles('admin', 'manager')
  async findUsersByRole(@Param('roleName') roleName: string) {
    const users = await this.userService.findUsersByRole(roleName);
    return {
      message: `获取角色为 ${roleName} 的用户列表成功`,
      data: users,
    };
  }

  /**
   * 获取最近活跃用户
   */
  @Get('recent-active')
  @Roles('admin', 'manager')
  async getRecentActiveUsers(
    @Query('days', ParseIntPipe) days = 7,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    const users = await this.userService.getRecentActiveUsers(days, limit);
    return {
      message: '获取最近活跃用户成功',
      data: users,
    };
  }

  /**
   * 获取用户活跃度报告
   */
  @Get('activity-report')
  @Roles('admin')
  async getUserActivityReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const report = await this.userService.getUserActivityReport(start, end);
    return {
      message: '获取用户活跃度报告成功',
      data: report,
    };
  }

  /**
   * 根据ID获取用户信息
   */
  @Get(':id')
  @Roles('admin', 'manager')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    return {
      message: '获取用户信息成功',
      data: user,
    };
  }

  /**
   * 更新用户信息
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: CurrentUserInfo,
  ) {
    // 普通用户只能更新自己的信息，管理员可以更新任何用户
    if (currentUser.id !== id && !currentUser.roles.includes('admin')) {
      throw new Error('无权限更新其他用户信息');
    }

    const user = await this.userService.update(id, updateUserDto);
    return {
      message: '更新用户信息成功',
      data: user,
    };
  }

  /**
   * 删除用户（仅管理员）
   */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
    return {
      message: '删除用户成功',
    };
  }

  /**
   * 为用户分配角色（仅管理员）
   */
  @Post(':id/roles')
  @Roles('admin')
  async assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body('roleIds') roleIds: number[],
  ) {
    const user = await this.userService.assignRoles(id, roleIds);
    return {
      message: '分配角色成功',
      data: user,
    };
  }

  /**
   * 移除用户角色（仅管理员）
   */
  @Delete(':id/roles')
  @Roles('admin')
  async removeRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body('roleIds') roleIds: number[],
  ) {
    const user = await this.userService.removeRoles(id, roleIds);
    return {
      message: '移除角色成功',
      data: user,
    };
  }

  /**
   * 批量更新用户状态（仅管理员）
   */
  @Patch('batch/status')
  @Roles('admin')
  async batchUpdateStatus(
    @Body('userIds') userIds: number[],
    @Body('isActive') isActive: boolean,
  ) {
    await this.userService.batchUpdateStatus(userIds, isActive);
    return {
      message: '批量更新用户状态成功',
    };
  }
}
