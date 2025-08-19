import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { OperationLog } from '../../entities';
import { CreateOperationLogDto } from './dto/create-operation-log.dto';
import { QueryOperationLogDto } from './dto/query-operation-log.dto';

@Injectable()
export class OperationLogService {
  private readonly logger = new Logger(OperationLogService.name);

  constructor(
    @InjectRepository(OperationLog)
    private operationLogRepository: Repository<OperationLog>,
  ) {}

  /**
   * 创建操作日志
   */
  async create(
    createOperationLogDto: CreateOperationLogDto,
  ): Promise<OperationLog> {
    try {
      const log = this.operationLogRepository.create(createOperationLogDto);
      return await this.operationLogRepository.save(log);
    } catch (error) {
      this.logger.error(`创建操作日志失败: ${error.message}`, error.stack);
      // 日志记录失败不应该影响主业务流程，所以这里只记录错误但不抛出异常
      return null;
    }
  }

  /**
   * 分页查询操作日志
   */
  async findAll(queryDto: QueryOperationLogDto) {
    const {
      action,
      module,
      userId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
    } = queryDto;

    const queryBuilder = this.operationLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .select([
        'log.id',
        'log.action',
        'log.module',
        'log.description',
        'log.status',
        'log.ipAddress',
        'log.userAgent',
        'log.createdAt',
        'log.errorMessage',
        'user.id',
        'user.username',
      ]);

    // 条件过滤
    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }

    if (module) {
      queryBuilder.andWhere('log.module = :module', { module });
    }

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (status) {
      queryBuilder.andWhere('log.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // 排序
    queryBuilder.orderBy(`log.${sortBy}`, sortOrder);

    // 分页
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [logs, total] = await queryBuilder.getManyAndCount();

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 根据ID查找操作日志
   */
  async findOne(id: number): Promise<OperationLog> {
    return this.operationLogRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          email: true,
        },
      },
    });
  }

  /**
   * 获取操作统计信息
   */
  async getStatistics(startDate?: Date, endDate?: Date) {
    const queryBuilder = this.operationLogRepository.createQueryBuilder('log');

    if (startDate && endDate) {
      queryBuilder.where('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const result = await queryBuilder
      .select(['log.action', 'log.module', 'log.status', 'COUNT(*) as count'])
      .groupBy('log.action')
      .addGroupBy('log.module')
      .addGroupBy('log.status')
      .getRawMany();

    // 总体统计
    const totalStats = await queryBuilder
      .select([
        'COUNT(*) as total',
        'COUNT(CASE WHEN log.status = "SUCCESS" THEN 1 END) as successCount',
        'COUNT(CASE WHEN log.status = "FAILED" THEN 1 END) as failedCount',
      ])
      .getRawOne();

    return {
      total: parseInt(totalStats.total),
      successCount: parseInt(totalStats.successCount),
      failedCount: parseInt(totalStats.failedCount),
      successRate:
        totalStats.total > 0
          ? ((totalStats.successCount / totalStats.total) * 100).toFixed(2)
          : 0,
      details: result.map((item) => ({
        action: item.log_action,
        module: item.log_module,
        status: item.log_status,
        count: parseInt(item.count),
      })),
    };
  }

  /**
   * 获取用户操作统计
   */
  async getUserOperationStats(userId: number, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.operationLogRepository
      .createQueryBuilder('log')
      .select([
        'DATE(log.createdAt) as date',
        'log.action',
        'COUNT(*) as count',
      ])
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt >= :startDate', { startDate })
      .groupBy('DATE(log.createdAt)')
      .addGroupBy('log.action')
      .orderBy('date', 'DESC')
      .getRawMany();

    return result.map((item) => ({
      date: item.date,
      action: item.log_action,
      count: parseInt(item.count),
    }));
  }

  /**
   * 获取系统操作趋势
   */
  async getOperationTrend(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.operationLogRepository.query(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as success,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed,
        COUNT(DISTINCT user_id) as activeUsers
      FROM operation_logs 
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      `,
      [startDate],
    );

    return result.map((item) => ({
      date: item.date,
      total: parseInt(item.total),
      success: parseInt(item.success),
      failed: parseInt(item.failed),
      activeUsers: parseInt(item.activeUsers),
      successRate:
        item.total > 0 ? ((item.success / item.total) * 100).toFixed(2) : 0,
    }));
  }

  /**
   * 清理过期日志
   */
  async cleanupOldLogs(daysToKeep = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.operationLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    const deletedCount = result.affected || 0;
    this.logger.log(`清理了 ${deletedCount} 条过期日志记录`);

    return deletedCount;
  }

  /**
   * 批量创建操作日志
   */
  async createBatch(logs: CreateOperationLogDto[]): Promise<OperationLog[]> {
    try {
      const logEntities = this.operationLogRepository.create(logs);
      return await this.operationLogRepository.save(logEntities);
    } catch (error) {
      this.logger.error(`批量创建操作日志失败: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 获取热门操作
   */
  async getPopularOperations(limit = 10, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.operationLogRepository
      .createQueryBuilder('log')
      .select([
        'log.action',
        'log.module',
        'COUNT(*) as count',
        'COUNT(DISTINCT log.userId) as uniqueUsers',
      ])
      .where('log.createdAt >= :startDate', { startDate })
      .groupBy('log.action')
      .addGroupBy('log.module')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((item) => ({
      action: item.log_action,
      module: item.log_module,
      count: parseInt(item.count),
      uniqueUsers: parseInt(item.uniqueUsers),
    }));
  }
}
