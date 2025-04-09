import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { ObjectLiteral, Repository } from 'typeorm';

export function getRepository<T extends ObjectLiteral>(
  app: INestApplication,
  entity: EntityClassOrSchema,
): Repository<T> {
  return app.get<Repository<T>>(getRepositoryToken(entity));
}
