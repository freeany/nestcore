import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role, User } from '../../entities';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 创建角色
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // 检查角色名是否已存在
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('角色名已存在');
    }

    const role = this.roleRepository.create(createRoleDto);
    const savedRole = await this.roleRepository.save(role);

    this.logger.log(`创建角色成功: ${savedRole.name}`);
    return savedRole;
  }

  /**
   * 获取所有角色
   */
  async findAll(page = 1, limit = 10, search?: string) {
    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    if (search) {
      queryBuilder.where(
        '(role.name LIKE :search OR role.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('role.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [roles, total] = await queryBuilder.getManyAndCount();

    return {
      data: roles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 根据ID查找角色
   */
  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['users'],
      select: {
        users: {
          id: true,
          username: true,
          email: true,
          isActive: true,
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`ID为 ${id} 的角色不存在`);
    }

    return role;
  }

  /**
   * 根据名称查找角色
   */
  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
    });
  }

  /**
   * 获取角色统计信息
   */
  async getRoleStatistics(id: number) {
    const role = await this.findOne(id);

    const userCount = await this.userRepository
      .createQueryBuilder('user')
      // 如果使用Left join,那么会包含所有用户，即使没有角色的用户也会被包含。
      // 但由于 WHERE 条件 role.id = :roleId ，没有角色的用户会被过滤掉 结果相同，但查询效率较低
      // 而使用inner join,只统计 拥有指定角色 的用户， 不需要统计没有任何角色的用户
      .innerJoin('user.roles', 'role')
      .where('role.id = :roleId', { roleId: id })
      .getCount();

    const activeUserCount = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.id = :roleId', { roleId: id })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getCount();

    return {
      ...role,
      statistics: {
        totalUsers: userCount,
        activeUsers: activeUserCount,
        inactiveUsers: userCount - activeUserCount,
      },
    };
  }

  /**
   * 获取角色权限使用情况
   */
  async getPermissionUsage() {
    const roles = await this.roleRepository.find({
      where: { isActive: true },
    });

    const permissionMap = new Map<string, number>();

    roles.forEach((role) => {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach((permission) => {
          const count = permissionMap.get(permission) || 0;
          permissionMap.set(permission, count + 1);
        });
      }
    });

    return Array.from(permissionMap.entries())
      .map(([permission, count]) => ({ permission, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 更新角色
   */
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // 检查角色名是否已被其他角色使用
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.findByName(updateRoleDto.name);
      if (existingRole && existingRole.id !== id) {
        throw new ConflictException('角色名已存在');
      }
    }

    await this.roleRepository.update(id, updateRoleDto);

    this.logger.log(`更新角色成功: ${role.name}`);
    return this.findOne(id);
  }

  /**
   * 删除角色
   */
  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);

    // 检查是否有用户使用此角色
    const userCount = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.id = :roleId', { roleId: id })
      .getCount();

    if (userCount > 0) {
      throw new ConflictException(
        `无法删除角色，还有 ${userCount} 个用户正在使用此角色`,
      );
    }

    await this.roleRepository.remove(role);

    this.logger.log(`删除角色成功: ${role.name}`);
  }

  /**
   * 批量删除角色
   */
  async removeBatch(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.remove(id);
    }

    this.logger.log(`批量删除 ${ids.length} 个角色成功`);
  }

  /**
   * 获取所有活跃角色（用于下拉选择）
   */
  async getActiveRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { isActive: true },
      select: ['id', 'name', 'description'],
      order: { name: 'ASC' },
    });
  }

  /**
   * 复制角色
   */
  async duplicate(id: number, newName: string): Promise<Role> {
    const originalRole = await this.findOne(id);

    // 检查新角色名是否已存在
    const existingRole = await this.findByName(newName);
    if (existingRole) {
      throw new ConflictException('角色名已存在');
    }

    const newRole = this.roleRepository.create({
      name: newName,
      description: `${originalRole.description} (复制)`,
      permissions: originalRole.permissions,
      isActive: originalRole.isActive,
    });

    const savedRole = await this.roleRepository.save(newRole);

    this.logger.log(`复制角色成功: ${originalRole.name} -> ${newName}`);
    return savedRole;
  }

  /**
   * 批量更新角色状态
   */
  async batchUpdateStatus(ids: number[], isActive: boolean): Promise<void> {
    await this.roleRepository.update({ id: In(ids) }, { isActive });

    this.logger.log(`批量更新 ${ids.length} 个角色状态为 ${isActive}`);
  }

  /**
   * 获取角色层次结构（如果有父子关系的话，这里是示例）
   */
  async getRoleHierarchy() {
    const roles = await this.roleRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    // 这里可以根据实际需求构建角色层次结构
    // 例如：admin > manager > user
    const hierarchy = {
      admin: roles.filter((role) => role.name === 'admin'),
      manager: roles.filter((role) => role.name === 'manager'),
      user: roles.filter((role) => role.name === 'user'),
      others: roles.filter(
        (role) => !['admin', 'manager', 'user'].includes(role.name),
      ),
    };

    return hierarchy;
  }
}
