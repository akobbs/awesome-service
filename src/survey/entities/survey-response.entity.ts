import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
  Generated,
} from 'typeorm';
import { Survey } from './survey.entity';
import { User } from '../../users/user.entity';
import { SurveyAnswer } from './survey-answer.entity';

@Entity()
export class SurveyResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @ManyToOne(() => Survey)
  @JoinColumn({ name: 'surveyId' })
  survey: Survey;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @OneToMany(() => SurveyAnswer, (a) => a.response, { cascade: true })
  answers: SurveyAnswer[];

  @CreateDateColumn()
  submittedAt: Date;
}
