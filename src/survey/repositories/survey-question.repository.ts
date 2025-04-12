import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyQuestion } from '../entities/survey-question.entity';

export interface ISurveyQuestionRepository {
  create(data: Partial<SurveyQuestion>): SurveyQuestion;
}

@Injectable()
export class TypeOrmSurveyQuestionRepository
  implements ISurveyQuestionRepository
{
  constructor(
    @InjectRepository(SurveyQuestion)
    private readonly repo: Repository<SurveyQuestion>,
  ) {}

  create(data: Partial<SurveyQuestion>): SurveyQuestion {
    return this.repo.create(data);
  }
}
