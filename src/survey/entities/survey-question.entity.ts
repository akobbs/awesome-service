import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Generated,
} from 'typeorm';
import { Survey } from './survey.entity';

@Entity()
export class SurveyQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column()
  text: string;

  @Column({ default: 'text' })
  type: 'text' | 'multiple-choice' | 'scale';

  @Column('simple-array', { nullable: true })
  options?: string[]; // for multiple-choice

  @Column({ type: 'int', nullable: true })
  scaleMin?: number;

  @Column({ type: 'int', nullable: true })
  scaleMax?: number;

  @Column({ type: 'int', nullable: true })
  scaleStep?: number; // optional, default 1

  @Column('simple-json', { nullable: true })
  scaleLabels?: { [key: number]: string };

  @Column()
  order: number;

  @ManyToOne(() => Survey, (survey) => survey.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'surveyId' })
  survey: Survey;
}
