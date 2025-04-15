export abstract class BaseError {
  abstract readonly type: string;
  readonly message?: string;

  constructor(message?: string) {
    this.message = message;
  }
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
