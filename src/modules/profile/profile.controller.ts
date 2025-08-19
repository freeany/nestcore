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
  ForbiddenException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { type CurrentUserInfo } from '../../auth/decorators/current-user.decorator';

@Controller('profiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * 创建或更新当前用户资料
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProfileDto: CreateProfileDto,
    @CurrentUser() user: CurrentUserInfo,
  ) {
    const profile = await this.profileService.create(user.id, createProfileDto);
    return {
      message: '用户资料创建成功',
      data: profile,
    };
  }

  /**
   * 获取当前用户资料
   */
  @Get('me')
  async getMyProfile(@CurrentUser() user: CurrentUserInfo) {
    const profile = await this.profileService.findByUserId(user.id);
    return {
      message: '获取用户资料成功',
      data: profile,
    };
  }

  /**
   * 获取资料统计信息
   */
  @Get('statistics')
  @Roles('admin', 'manager')
  async getProfileStatistics() {
    const statistics = await this.profileService.getProfileStatistics();
    return {
      message: '获取资料统计信息成功',
      data: statistics,
    };
  }

  /**
   * 搜索用户资料
   */
  @Get('search')
  @Roles('admin', 'manager')
  async searchProfiles(
    @Query('keyword') keyword: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const result = await this.profileService.searchProfiles(
      keyword,
      Number(page),
      Number(limit),
    );
    return {
      message: '搜索用户资料成功',
      ...result,
    };
  }

  /**
   * 获取最近更新的资料
   */
  @Get('recent')
  @Roles('admin', 'manager')
  async getRecentlyUpdatedProfiles(@Query('limit') limit = 10) {
    const profiles = await this.profileService.getRecentlyUpdatedProfiles(
      Number(limit),
    );
    return {
      message: '获取最近更新资料成功',
      data: profiles,
    };
  }

  /**
   * 获取生日提醒
   */
  @Get('birthday-reminders')
  @Roles('admin', 'manager')
  async getBirthdayReminders() {
    const reminders = await this.profileService.getBirthdayReminders();
    return {
      message: '获取生日提醒成功',
      data: reminders,
    };
  }

  /**
   * 根据用户ID获取资料（管理员权限）
   */
  @Get('user/:userId')
  @Roles('admin', 'manager')
  async getProfileByUserId(@Param('userId', ParseIntPipe) userId: number) {
    const profile = await this.profileService.findByUserId(userId);
    return {
      message: '获取用户资料成功',
      data: profile,
    };
  }

  /**
   * 根据资料ID获取详情
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserInfo,
  ) {
    const profile = await this.profileService.findOne(id);

    // 检查权限：只有管理员、经理或资料所有者可以查看
    if (
      !['admin', 'manager'].includes(user.role) &&
      profile.user.id !== user.id
    ) {
      throw new ForbiddenException('无权限查看此资料');
    }

    return {
      message: '获取资料详情成功',
      data: profile,
    };
  }

  /**
   * 更新当前用户资料
   */
  @Patch('me')
  async updateMyProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: CurrentUserInfo,
  ) {
    const profile = await this.profileService.update(user.id, updateProfileDto);
    return {
      message: '用户资料更新成功',
      data: profile,
    };
  }

  /**
   * 更新指定用户资料（管理员权限）
   */
  @Patch('user/:userId')
  @Roles('admin')
  async updateUserProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: CurrentUserInfo,
  ) {
    const profile = await this.profileService.update(userId, updateProfileDto);
    return {
      message: '用户资料更新成功',
      data: profile,
    };
  }

  /**
   * 删除当前用户资料
   */
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMyProfile(@CurrentUser() user: CurrentUserInfo) {
    await this.profileService.remove(user.id);
    return {
      message: '用户资料删除成功',
    };
  }

  /**
   * 删除指定用户资料（管理员权限）
   */
  @Delete('user/:userId')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUserProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: CurrentUserInfo,
  ) {
    await this.profileService.remove(userId);
    return {
      message: '用户资料删除成功',
    };
  }

  /**
   * 批量更新头像
   */
  @Patch('batch/avatars')
  @Roles('admin')
  async batchUpdateAvatars(
    @Body('updates') updates: { userId: number; avatar: string }[],
    @CurrentUser() user: CurrentUserInfo,
  ) {
    const results = await this.profileService.batchUpdateAvatars(updates);
    return {
      message: '批量更新头像完成',
      data: results,
    };
  }
}
