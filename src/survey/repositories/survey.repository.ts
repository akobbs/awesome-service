import { Survey, SurveyStatus } from '../entities/survey.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Result } from '../../common/types';
import {
  SurveyNotFoundError,
  SurveyVersionMismatchError,
} from '../survey.errors';
import { err, ok } from '../../common/utils';
import { SurveyQuestion } from '../entities/survey-question.entity';
import { UnknownError } from '../../common/errors';

export interface ISurveyRepository {
  create(data: Partial<Survey>): Survey;
  save(survey: Survey): Promise<Survey>;
  updateSurveyWithOptimisticLock(params: {
    uuid: string;
    version: number;
    update: {
      title?: string;
      description?: string;
      expiresAt?: Date;
      questions?: SurveyQuestion[];
    };
  }): Promise<
    Result<
      Survey,
      SurveyNotFoundError | SurveyVersionMismatchError | UnknownError
    >
  >;
  findByUuid(uuid: string): Promise<Survey | null>;
  findPaginated(params: {
    page: number;
    limit: number;
    status?: SurveyStatus;
  }): Promise<{ total: number; items: Survey[] }>;
}

@Injectable()
export class TypeOrmSurveyRepository implements ISurveyRepository {
  constructor(
    @InjectRepository(Survey)
    private readonly repo: Repository<Survey>,
  ) {}

  create(data: Partial<Survey>): Survey {
    return this.repo.create(data);
  }

  save(survey: Survey): Promise<Survey> {
    return this.repo.save(survey);
  }

  async updateSurveyWithOptimisticLock(params: {
    uuid: string;
    version: number;
    update: {
      title?: string;
      description?: string;
      expiresAt?: Date;
      questions?: SurveyQuestion[];
    };
  }): Promise<
    Result<
      Survey,
      SurveyNotFoundError | SurveyVersionMismatchError | UnknownError
    >
  > {
    try {
      const entity = await this.repo.findOne({
        where: { uuid: params.uuid },
        lock: { mode: 'optimistic', version: params.version },
        relations: ['questions'],
      });

      if (!entity) return err(new SurveyNotFoundError());

      const { update } = params;

      if (update.title !== undefined) entity.title = update.title;
      if (update.description !== undefined)
        entity.description = update.description;
      if (update.expiresAt !== undefined) entity.expiresAt = update.expiresAt;
      if (update.questions !== undefined) entity.questions = update.questions;

      const saved = await this.repo.save(entity);
      return ok(saved);
    } catch (e) {
      if (e.name === 'OptimisticLockVersionMismatchError') {
        return err(new SurveyVersionMismatchError());
      }

      return err(new UnknownError());
    }
  }

  async findByUuid(uuid: string): Promise<Survey | null> {
    return this.repo.findOne({ where: { uuid }, relations: ['questions'] });
  }

  async findPaginated(params: {
    page: number;
    limit: number;
    status?: SurveyStatus;
  }): Promise<{ total: number; items: Survey[] }> {
    const { page, limit, status } = params;

    const [items, total] = await this.repo.findAndCount({
      where: status ? { status } : {},
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { items, total };
  }
}
