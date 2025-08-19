import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('operation_logs')
@Index(['userId', 'createdAt']) // 复合索引，优化查询性能
@Index(['action']) // 操作类型索引
export class OperationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  action: string; // 操作类型：CREATE, UPDATE, DELETE, LOGIN, LOGOUT等

  @Column({ length: 100 })
  module: string; // 操作模块：USER, ROLE, PROFILE等

  @Column({ type: 'text', nullable: true })
  description: string; // 操作描述

  @Column({ type: 'json', nullable: true })
  oldData: any; // 操作前的数据

  @Column({ type: 'json', nullable: true })
  newData: any; // 操作后的数据

  @Column({ length: 45, nullable: true })
  ipAddress: string; // IP地址

  @Column({ length: 500, nullable: true })
  userAgent: string; // 用户代理

  @Column({ enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' })
  status: string; // 操作状态

  @Column({ type: 'text', nullable: true })
  errorMessage: string; // 错误信息（如果操作失败）

  @CreateDateColumn()
  createdAt: Date;

  // 多对一关系：关联用户
  @ManyToOne(() => User, (user) => user.operationLogs, {
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: number;
}
