import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Generated,
  VersionColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { SurveyQuestion } from './survey-question.entity';

export type SurveyStatus = 'draft' | 'active' | 'archived';

@Entity()
export class Survey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'archived'],
    default: 'draft',
  })
  status: SurveyStatus;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => SurveyQuestion, (q) => q.survey, { cascade: true })
  questions: SurveyQuestion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn({ default: 1 })
  version: number;
}
