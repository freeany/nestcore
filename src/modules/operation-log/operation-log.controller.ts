import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OperationLogService } from './operation-log.service';
import { QueryOperationLogDto } from './dto/query-operation-log.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('operation-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService) {}

  /**
   * 获取操作日志列表（admin和manager可查看）
   */
  @Get()
  @Roles('admin', 'manager')
  async findAll(@Query() queryDto: QueryOperationLogDto) {
    const result = await this.operationLogService.findAll(queryDto);
    return {
      message: '获取操作日志列表成功',
      ...result,
    };
  }

  /**
   * 获取当前用户的操作日志
   */
  @Get('my-logs')
  async getMyLogs(
    @CurrentUser('id') userId: number,
    @Query() queryDto: QueryOperationLogDto,
  ) {
    const result = await this.operationLogService.findAll({
      ...queryDto,
      userId,
    });
    return {
      message: '获取个人操作日志成功',
      ...result,
    };
  }

  /**
   * 获取操作统计信息
   */
  @Get('statistics')
  @Roles('admin', 'manager')
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const statistics = await this.operationLogService.getStatistics(start, end);
    return {
      message: '获取操作统计信息成功',
      data: statistics,
    };
  }

  /**
   * 获取用户操作统计
   */
  @Get('user-stats/:userId')
  @Roles('admin', 'manager')
  async getUserOperationStats(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('days', ParseIntPipe) days = 30,
  ) {
    const stats = await this.operationLogService.getUserOperationStats(
      userId,
      days,
    );
    return {
      message: '获取用户操作统计成功',
      data: stats,
    };
  }

  /**
   * 获取当前用户操作统计
   */
  @Get('my-stats')
  async getMyOperationStats(
    @CurrentUser('id') userId: number,
    @Query('days', ParseIntPipe) days = 30,
  ) {
    const stats = await this.operationLogService.getUserOperationStats(
      userId,
      days,
    );
    return {
      message: '获取个人操作统计成功',
      data: stats,
    };
  }

  /**
   * 获取系统操作趋势
   */
  @Get('trend')
  @Roles('admin', 'manager')
  async getOperationTrend(@Query('days', ParseIntPipe) days = 7) {
    const trend = await this.operationLogService.getOperationTrend(days);
    return {
      message: '获取系统操作趋势成功',
      data: trend,
    };
  }

  /**
   * 获取热门操作
   */
  @Get('popular')
  @Roles('admin', 'manager')
  async getPopularOperations(
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('days', ParseIntPipe) days = 30,
  ) {
    const popular = await this.operationLogService.getPopularOperations(
      limit,
      days,
    );
    return {
      message: '获取热门操作成功',
      data: popular,
    };
  }

  /**
   * 根据ID获取操作日志详情
   */
  @Get(':id')
  @Roles('admin', 'manager')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const log = await this.operationLogService.findOne(id);
    return {
      message: '获取操作日志详情成功',
      data: log,
    };
  }

  /**
   * 清理过期日志（仅管理员）
   */
  @Delete('cleanup')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async cleanupOldLogs(@Query('days', ParseIntPipe) days = 90) {
    const deletedCount = await this.operationLogService.cleanupOldLogs(days);
    return {
      message: '清理过期日志成功',
      data: {
        deletedCount,
        daysKept: days,
      },
    };
  }
}
