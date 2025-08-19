import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';
import { Profile } from './profile.entity';
import { OperationLog } from './operation-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 255 })
  @Exclude() // 在序列化时排除密码字段
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 一对一关系：用户资料
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
    eager: false,
  })
  profile: Profile;

  // 多对多关系：用户角色
  @ManyToMany(() => Role, (role) => role.users, {
    cascade: false,
    eager: false,
  })
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  // 一对多关系：操作日志
  @OneToMany(() => OperationLog, (log) => log.user)
  operationLogs: OperationLog[];
}
