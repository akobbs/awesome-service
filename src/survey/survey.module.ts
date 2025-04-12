import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Survey } from './entities/survey.entity';
import { SurveyQuestion } from './entities/survey-question.entity';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import {
  SURVEY_QUESTION_REPOSITORY,
  SURVEY_REPOSITORY,
} from './survey.constants';
import { TypeOrmSurveyRepository } from './repositories/survey.repository';
import { TypeOrmSurveyQuestionRepository } from './repositories/survey-question.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Survey, SurveyQuestion])],
  controllers: [SurveyController],
  providers: [
    SurveyService,
    {
      provide: SURVEY_REPOSITORY,
      useClass: TypeOrmSurveyRepository,
    },
    {
      provide: SURVEY_QUESTION_REPOSITORY,
      useClass: TypeOrmSurveyQuestionRepository,
    },
  ],
})
export class SurveyModule {}
