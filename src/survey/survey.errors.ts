import { BaseError } from '../common/errors';

export class SurveyNotFoundError extends BaseError {
  readonly type = 'SurveyNotFoundError';
}

export class SurveyVersionMismatchError extends BaseError {
  readonly type = 'SurveyVersionMismatchError';
}

export class InvalidStatusTransitionError extends BaseError {
  readonly type = 'InvalidStatusTransitionError' as const;
}
