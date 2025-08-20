import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Role, Profile, OperationLog } from '../../entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(OperationLog)
    private operationLogRepository: Repository<OperationLog>,
  ) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);

    // 创建默认用户资料
    const profile = this.profileRepository.create({
      userId: savedUser.id,
    });
    await this.profileRepository.save(profile);

    this.logger.log(`创建用户成功: ${savedUser.username}`);
    return savedUser;
  }

  /**
   * 分页查询用户列表（多表联查示例1）
   */
  async findAll(queryDto: QueryUserDto) {
    const {
      username,
      email,
      isActive,
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
      search,
    } = queryDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.profile', 'profile')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.isActive',
        'user.lastLoginAt',
        'user.createdAt',
        'user.updatedAt',
        'role.id',
        'role.name',
        'role.description',
        'profile.id',
        'profile.firstName',
        'profile.lastName',
        'profile.phone',
        'profile.avatar',
      ]);

    // 条件过滤
    if (username) {
      queryBuilder.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    if (email) {
      queryBuilder.andWhere('user.email LIKE :email', {
        email: `%${email}%`,
      });
    }

    if (typeof isActive === 'boolean') {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    // 全文搜索
    if (search) {
      queryBuilder.andWhere(
        '(user.username LIKE :search OR user.email LIKE :search OR profile.firstName LIKE :search OR profile.lastName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 排序
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    // 分页
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 根据ID查找用户（多表联查示例2）
   */
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'profile'],
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          id: true,
          name: true,
          description: true,
          permissions: true,
        },
        profile: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          birthday: true,
          gender: true,
          address: true,
          bio: true,
          avatar: true,
          company: true,
          position: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`ID为 ${id} 的用户不存在`);
    }

    return user;
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /**
   * 根据用户名查找用户（包含角色信息）
   */
  async findByUsernameWithRoles(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['roles'],
    });
  }

  /**
   * 根据ID查找用户（包含角色信息）
   */
  async findByIdWithRoles(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  /**
   * 获取用户详细信息（多表联查示例3）
   */
  async getUserDetails(id: number) {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoin('user.operationLogs', 'log')
      .addSelect([
        'COUNT(DISTINCT log.id) as logCount',
        'MAX(log.createdAt) as lastActivity',
      ])
      .where('user.id = :id', { id })
      .groupBy('user.id')
      .addGroupBy('role.id')
      .addGroupBy('profile.id')
      .getRawAndEntities();

    if (!result.entities.length) {
      throw new NotFoundException(`ID为 ${id} 的用户不存在`);
    }

    const user = result.entities[0];
    const raw = result.raw[0];

    return {
      ...user,
      statistics: {
        logCount: parseInt(raw.logCount) || 0,
        lastActivity: raw.lastActivity,
      },
    };
  }

  /**
   * 获取用户操作日志（多表联查示例4）
   */
  async getUserOperationLogs(userId: number, page = 1, limit = 10) {
    const [logs, total] = await this.operationLogRepository.findAndCount({
      where: { userId },
      relations: ['user'],
      select: {
        id: true,
        action: true,
        module: true,
        description: true,
        status: true,
        ipAddress: true,
        createdAt: true,
        user: {
          id: true,
          username: true,
        },
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取用户统计信息（多表联查示例5）
   */
  async getUserStatistics(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'profile', 'operationLogs'],
    });

    if (!user) {
      throw new NotFoundException(`ID为 ${userId} 的用户不存在`);
    }

    // 使用原生SQL进行复杂统计查询
    const statistics = await this.userRepository.query(
      `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.created_at as joinDate,
        u.last_login_at as lastLogin,
        COUNT(DISTINCT ur.role_id) as roleCount,
        COUNT(DISTINCT ol.id) as totalLogs,
        COUNT(DISTINCT CASE WHEN ol.action = 'LOGIN' THEN ol.id END) as loginCount,
        COUNT(DISTINCT CASE WHEN ol.status = 'FAILED' THEN ol.id END) as failedOperations,
        MAX(ol.created_at) as lastActivity
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN operation_logs ol ON u.id = ol.user_id
      WHERE u.id = ?
      GROUP BY u.id
      `,
      [userId],
    );

    return statistics[0] || null;
  }

  /**
   * 根据角色查找用户（多表联查示例6）
   */
  async findUsersByRole(roleName: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('role.name = :roleName', { roleName })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.createdAt',
        'profile.firstName',
        'profile.lastName',
        'profile.avatar',
      ])
      .getMany();
  }

  /**
   * 获取最近活跃用户（多表联查示例7）
   */
  async getRecentActiveUsers(days = 7, limit = 10) {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoin('user.operationLogs', 'log')
      .where('log.createdAt >= :dateFrom', { dateFrom })
      .groupBy('user.id')
      .addGroupBy('profile.id')
      .orderBy('MAX(log.createdAt)', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * 更新用户
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // 检查用户名是否已被其他用户使用
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.findByUsername(updateUserDto.username);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 检查邮箱是否已被其他用户使用
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('邮箱已存在');
      }
    }

    // 如果更新密码，需要加密
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    await this.userRepository.update(id, updateUserDto);

    this.logger.log(`更新用户成功: ${user.username}`);
    return this.findById(id);
  }

  /**
   * 删除用户
   */
  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);

    this.logger.log(`删除用户成功: ${user.username}`);
  }

  /**
   * 为用户分配角色
   */
  async assignRoles(userId: number, roleIds: number[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`ID为 ${userId} 的用户不存在`);
    }

    const roles = await this.roleRepository.findBy({
      id: In(roleIds),
    });

    user.roles = roles;
    await this.userRepository.save(user);

    this.logger.log(`为用户 ${user.username} 分配角色成功`);
    return this.findById(userId);
  }

  /**
   * 移除用户角色
   */
  async removeRoles(userId: number, roleIds: number[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`ID为 ${userId} 的用户不存在`);
    }

    user.roles = user.roles.filter((role) => !roleIds.includes(role.id));
    await this.userRepository.save(user);

    this.logger.log(`移除用户 ${user.username} 角色成功`);
    return this.findById(userId);
  }

  /**
   * 更新最后登录时间
   */
  async updateLastLoginTime(id: number): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * 批量操作示例：批量更新用户状态
   */
  async batchUpdateStatus(userIds: number[], isActive: boolean): Promise<void> {
    await this.userRepository.update({ id: In(userIds) }, { isActive });

    this.logger.log(`批量更新 ${userIds.length} 个用户状态为 ${isActive}`);
  }

  /**
   * 复杂查询示例：获取用户活跃度报告
   */
  async getUserActivityReport(startDate: Date, endDate: Date) {
    return this.userRepository.query(
      `
      SELECT 
        u.id,
        u.username,
        u.email,
        COUNT(ol.id) as totalOperations,
        COUNT(DISTINCT DATE(ol.created_at)) as activeDays,
        COUNT(CASE WHEN ol.action = 'LOGIN' THEN 1 END) as loginCount,
        MAX(ol.created_at) as lastActivity,
        AVG(CASE WHEN ol.status = 'SUCCESS' THEN 1 ELSE 0 END) as successRate
      FROM users u
      LEFT JOIN operation_logs ol ON u.id = ol.user_id 
        AND ol.created_at BETWEEN ? AND ?
      WHERE u.is_active = 1
      GROUP BY u.id, u.username, u.email
      ORDER BY totalOperations DESC
      `,
      [startDate, endDate],
    );
  }
}
