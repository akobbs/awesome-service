export abstract class BaseError {
  abstract readonly type: string;
}

export class InvalidCredentialsError extends BaseError {
  readonly type = 'InvalidCredentialsError';
}

export class EmailNotVerifiedError extends BaseError {
  readonly type = 'EmailNotVerifiedError';
}

export class EmailAlreadyExistsError extends BaseError {
  readonly type = 'EmailAlreadyExistsError';
}

export class UnknownError extends BaseError {
  readonly type = 'UnknownError';
}
