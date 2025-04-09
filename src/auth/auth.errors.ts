export abstract class BaseError {
  abstract readonly type: string;
}

export class InvalidCredentialsError extends BaseError {
  readonly type = 'InvalidCredentialsError' as const;
}

export class EmailNotVerifiedError extends BaseError {
  readonly type = 'EmailNotVerifiedError' as const;
}

export class EmailAlreadyExistsError extends BaseError {
  readonly type = 'EmailAlreadyExistsError' as const;
}

export class UnknownError extends BaseError {
  readonly type = 'UnknownError' as const;
}
