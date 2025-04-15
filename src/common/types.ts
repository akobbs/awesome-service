import { Request } from 'express';
import { AccessTokenPayload } from '../auth/types';
import { BaseError } from './errors';
import { HttpException } from '@nestjs/common';

export interface RequestWithUser extends Request {
  user: AccessTokenPayload;
}

export type Result<T, E> = Success<T> | Failure<E>;

export type Success<T> = {
  ok: true;
  value: T;
};

export type Failure<E> = {
  ok: false;
  error: E;
};

export type ErrorTypeMap<E extends BaseError> = {
  [K in E as K['type']]: (e: E) => HttpException;
};
