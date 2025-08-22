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
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserInfo } from '../../auth/decorators/current-user.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * 创建角色
   */
  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.roleService.create(createRoleDto);
    return {
      message: '角色创建成功',
      data: role,
    };
  }

  /**
   * 获取角色列表
   */
  @Get()
  @Roles('admin', 'manager')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    const result = await this.roleService.findAll(
      Number(page),
      Number(limit),
      search,
    );
    return {
      message: '获取角色列表成功',
      ...result,
    };
  }

  /**
   * 获取活跃角色列表（用于下拉选择）
   */
  @Get('active')
  @Roles('admin', 'manager')
  async getActiveRoles() {
    const roles = await this.roleService.getActiveRoles();
    return {
      message: '获取活跃角色列表成功',
      data: roles,
    };
  }

  /**
   * 获取角色权限使用情况
   */
  @Get('permission-usage')
  @Roles('admin')
  async getPermissionUsage() {
    const usage = await this.roleService.getPermissionUsage();
    return {
      message: '获取权限使用情况成功',
      data: usage,
    };
  }

  /**
   * 获取角色层次结构
   */
  @Get('hierarchy')
  @Roles('admin')
  async getRoleHierarchy() {
    const hierarchy = await this.roleService.getRoleHierarchy();
    return {
      message: '获取角色层次结构成功',
      data: hierarchy,
    };
  }

  /**
   * 根据ID获取角色详情
   */
  @Get(':id')
  @Roles('admin', 'manager')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const role = await this.roleService.findOne(id);
    return {
      message: '获取角色详情成功',
      data: role,
    };
  }

  /**
   * 获取角色统计信息
   */
  @Get(':id/statistics')
  @Roles('admin', 'manager')
  async getRoleStatistics(@Param('id', ParseIntPipe) id: number) {
    const statistics = await this.roleService.getRoleStatistics(id);
    return {
      message: '获取角色统计信息成功',
      data: statistics,
    };
  }

  /**
   * 更新角色
   */
  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.roleService.update(id, updateRoleDto);
    return {
      message: '角色更新成功',
      data: role,
    };
  }

  /**
   * 删除角色
   */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.roleService.remove(id);
    return {
      message: '角色删除成功',
    };
  }

  /**
   * 复制角色
   */
  @Post(':id/duplicate')
  @Roles('admin')
  async duplicate(
    @Param('id', ParseIntPipe) id: number,
    @Body('newName') newName: string,
  ) {
    const role = await this.roleService.duplicate(id, newName);
    return {
      message: '角色复制成功',
      data: role,
    };
  }

  /**
   * 批量删除角色
   */
  @Delete('batch')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBatch(@Body('ids') ids: number[]) {
    await this.roleService.removeBatch(ids);
    return {
      message: '批量删除角色成功',
    };
  }

  /**
   * 批量更新角色状态
   */
  @Patch('batch/status')
  @Roles('admin')
  async batchUpdateStatus(
    @Body('ids') ids: number[],
    @Body('isActive') isActive: boolean,
  ) {
    await this.roleService.batchUpdateStatus(ids, isActive);
    return {
      message: '批量更新角色状态成功',
    };
  }
}
