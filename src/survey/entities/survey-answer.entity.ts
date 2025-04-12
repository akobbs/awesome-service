import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Generated,
} from 'typeorm';
import { SurveyQuestion } from './survey-question.entity';
import { SurveyResponse } from './survey-response.entity';

@Entity()
export class SurveyAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @ManyToOne(() => SurveyResponse, (r) => r.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'responseId' })
  response: SurveyResponse;

  @ManyToOne(() => SurveyQuestion)
  @JoinColumn({ name: 'questionId' })
  question: SurveyQuestion;

  @Column('text')
  answer: string; // store as JSON or plain text depending on type
}
