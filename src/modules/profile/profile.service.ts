import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Profile, User } from '../../entities';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 创建用户资料
   */
  async create(
    userId: number,
    createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    // 检查用户是否存在
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`ID为 ${userId} 的用户不存在`);
    }

    // 检查用户是否已有资料
    const existingProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (existingProfile) {
      // 如果已存在，则更新
      return this.update(userId, createProfileDto);
    }

    const profile = this.profileRepository.create({
      ...createProfileDto,
      user,
    });

    const savedProfile = await this.profileRepository.save(profile);

    this.logger.log(`创建用户资料成功: 用户ID ${userId}`);
    return savedProfile;
  }

  /**
   * 根据用户ID查找资料
   */
  async findByUserId(userId: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          email: true,
          isActive: true,
          createdAt: true,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`用户ID ${userId} 的资料不存在`);
    }

    return profile;
  }

  /**
   * 根据资料ID查找
   */
  async findOne(id: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          email: true,
          isActive: true,
          createdAt: true,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`ID为 ${id} 的资料不存在`);
    }

    return profile;
  }

  /**
   * 更新用户资料
   */
  async update(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.findByUserId(userId);

    await this.profileRepository.update(profile.id, updateProfileDto);

    this.logger.log(`更新用户资料成功: 用户ID ${userId}`);
    return this.findByUserId(userId);
  }

  /**
   * 删除用户资料
   */
  async remove(userId: number): Promise<void> {
    const profile = await this.findByUserId(userId);

    await this.profileRepository.remove(profile);

    this.logger.log(`删除用户资料成功: 用户ID ${userId}`);
  }

  /**
   * 获取资料统计信息
   */
  async getProfileStatistics() {
    const totalProfiles = await this.profileRepository.count();

    const profilesWithAvatar = await this.profileRepository.count({
      where: { avatar: Not(IsNull()) }, // 有头像的用户
    });

    const profilesWithPhone = await this.profileRepository.count({
      where: { phone: Not(IsNull()) }, // 有手机号的用户
    });

    const profilesWithRealName = await this.profileRepository.count({
      where: { realName: Not(IsNull()) }, // 有真实姓名的用户
    });

    const profilesWithBio = await this.profileRepository.count({
      where: { bio: Not(IsNull()) }, // 有个人简介的用户
    });

    const genderStats = await this.profileRepository
      .createQueryBuilder('profile')
      .select('profile.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .where('profile.gender IS NOT NULL')
      .groupBy('profile.gender')
      .getRawMany();

    return {
      totalProfiles,
      completionStats: {
        withAvatar: profilesWithAvatar,
        withPhone: profilesWithPhone,
        withRealName: profilesWithRealName,
        withBio: profilesWithBio,
      },
      genderDistribution: genderStats.map((stat) => ({
        gender: stat.gender,
        count: parseInt(stat.count),
      })),
    };
  }

  /**
   * 搜索用户资料
   */
  async searchProfiles(keyword: string, page = 1, limit = 10) {
    const queryBuilder = this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where(
        '(profile.realName LIKE :keyword OR profile.nickname LIKE :keyword OR profile.company LIKE :keyword OR profile.position LIKE :keyword OR user.username LIKE :keyword)',
        { keyword: `%${keyword}%` },
      )
      .andWhere('user.isActive = :isActive', { isActive: true })
      .select([
        'profile.id',
        'profile.realName',
        'profile.nickname',
        'profile.avatar',
        'profile.company',
        'profile.position',
        'profile.bio',
        'user.id',
        'user.username',
        'user.email',
      ])
      .orderBy('profile.updatedAt', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [profiles, total] = await queryBuilder.getManyAndCount();

    return {
      data: profiles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取最近更新的资料
   */
  async getRecentlyUpdatedProfiles(limit = 10) {
    return this.profileRepository.find({
      relations: ['user'],
      select: {
        id: true,
        realName: true,
        nickname: true,
        avatar: true,
        updatedAt: true,
        user: {
          id: true,
          username: true,
          email: true,
        },
      },
      where: {
        user: {
          isActive: true,
        },
      },
      order: {
        updatedAt: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * 获取生日提醒（本月生日的用户）
   */
  async getBirthdayReminders() {
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthStr = currentMonth.toString().padStart(2, '0');

    return this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('MONTH(profile.birthday) = :month', { month: currentMonth })
      .andWhere('profile.birthday IS NOT NULL')
      .andWhere('user.isActive = :isActive', { isActive: true })
      .select([
        'profile.id',
        'profile.realName',
        'profile.nickname',
        'profile.avatar',
        'profile.birthday',
        'user.id',
        'user.username',
        'user.email',
      ])
      .orderBy('DAY(profile.birthday)', 'ASC')
      .getMany();
  }

  /**
   * 批量更新头像
   */
  async batchUpdateAvatars(updates: { userId: number; avatar: string }[]) {
    const promises = updates.map(async ({ userId, avatar }) => {
      try {
        const profile = await this.findByUserId(userId);
        await this.profileRepository.update(profile.id, { avatar });
        return { userId, success: true };
      } catch (error) {
        return { userId, success: false, error: error.message };
      }
    });

    const results = await Promise.all(promises);

    this.logger.log(
      `批量更新头像完成: ${results.filter((r) => r.success).length}/${results.length}`,
    );
    return results;
  }
}
