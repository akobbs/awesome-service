import { HttpException, NotFoundException } from '@nestjs/common';
import { BaseError } from './errors';
import { ErrorTypeMap, Result } from './types';

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

export function unwrapResultOrThrow<T, E extends BaseError>(
  result: Result<T, E>,
  handlers: ErrorTypeMap<E>,
): T {
  if (result.ok) {
    return result.value;
  }

  const type = result.error.type as keyof ErrorTypeMap<E>;
  const handler = handlers[type] as () => HttpException;

  throw handler();
}

export function assertFound<T>(
  value: T | undefined | null,
  msg = 'Not found',
): T {
  if (!value) {
    throw new NotFoundException(msg);
  }

  return value;
}
