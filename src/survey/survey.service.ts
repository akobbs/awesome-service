import { Inject, Injectable } from '@nestjs/common';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { PaginateSurveysQueryDto } from './dto/paginate-surveys.dto';
import { ISurveyRepository } from './repositories/survey.repository';
import {
  SURVEY_QUESTION_REPOSITORY,
  SURVEY_REPOSITORY,
} from './survey.constants';
import { ISurveyQuestionRepository } from './repositories/survey-question.repository';
import { Survey } from './entities/survey.entity';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import {
  SurveyNotFoundError,
  SurveyVersionMismatchError,
} from './survey.errors';
import { Result } from '../common/types';
import { UnknownError } from '../common/errors';

@Injectable()
export class SurveyService {
  constructor(
    @Inject(SURVEY_REPOSITORY)
    private readonly surveyRepo: ISurveyRepository,

    @Inject(SURVEY_QUESTION_REPOSITORY)
    private readonly questionRepo: ISurveyQuestionRepository,
  ) {}

  async createSurvey(dto: CreateSurveyDto) {
    const survey = this.surveyRepo.create({
      ...dto,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      questions: dto.questions.map((q) => this.questionRepo.create(q)),
    });

    const saved = await this.surveyRepo.save(survey);
    return saved;
  }

  async getPaginatedSurveys(query: PaginateSurveysQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    return this.surveyRepo.findPaginated({
      page,
      limit: safeLimit,
      status: query.status,
    });
  }

  async getSurveyByUuid(uuid: string): Promise<Survey | null> {
    return this.surveyRepo.findByUuid(uuid);
  }

  async updateSurvey(
    uuid: string,
    dto: UpdateSurveyDto,
  ): Promise<
    Result<
      Survey,
      SurveyNotFoundError | SurveyVersionMismatchError | UnknownError
    >
  > {
    return this.surveyRepo.updateSurveyWithOptimisticLock({
      uuid,
      version: dto.version,
      update: {
        title: dto.title,
        description: dto.description,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        questions: dto.questions?.map((q) => this.questionRepo.create(q)),
      },
    });
  }
}
