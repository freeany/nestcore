import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: true })
  firstName: string;

  @Column({ length: 50, nullable: true })
  lastName: string;

  @Column({ length: 50, nullable: true })
  realName: string;

  @Column({ length: 20, nullable: true })
  nickname: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender: string;

  @Column({ length: 200, nullable: true })
  address: string;

  @Column({ length: 500, nullable: true })
  bio: string; // 个人简介

  @Column({ length: 255, nullable: true })
  avatar: string; // 头像URL

  @Column({ length: 100, nullable: true })
  company: string;

  @Column({ length: 100, nullable: true })
  position: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ length: 50, nullable: true })
  wechat: string;

  @Column({ length: 50, nullable: true })
  qq: string;

  @Column({ length: 50, nullable: true })
  weibo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 一对一关系：关联用户
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;
}
