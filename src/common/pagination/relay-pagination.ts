import { BaseError } from '../errors';
import { Result } from '../types';
import { err, ok } from '../utils';
import { RelayEdgesPaginatedResult, RelayPaginationInput } from './types';

export class InvalidRelayPaginationInputError extends BaseError {
  readonly type = 'InvalidRelayPaginationInputError' as const;
  constructor(public message: string) {
    super(message);
  }
}

export function validateRelayPagination(
  input: RelayPaginationInput,
): Result<null, InvalidRelayPaginationInputError> {
  const { first, last, after, before } = input;

  if (!first && !last) {
    return err(
      new InvalidRelayPaginationInputError(
        'You must provide either "first" or "last".',
      ),
    );
  }

  if (first && last) {
    return err(
      new InvalidRelayPaginationInputError(
        'Cannot use both "first" and "last" together.',
      ),
    );
  }

  if (after && last) {
    return err(
      new InvalidRelayPaginationInputError(
        '"after" must be used with "first", not "last".',
      ),
    );
  }

  if (before && first) {
    return err(
      new InvalidRelayPaginationInputError(
        '"before" must be used with "last", not "first".',
      ),
    );
  }

  return ok(null);
}

export function getLimit(input: RelayPaginationInput): number {
  return input.first ?? input.last ?? 10;
}

export function getDirection(
  input: RelayPaginationInput,
): 'forward' | 'backward' {
  return input.first ? 'forward' : 'backward';
}

export function encodeCursor(uuid: string): string {
  return Buffer.from(uuid).toString('base64');
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('utf-8');
}

export function applyCursorPagination<T extends { uuid: string }>(
  items: T[],
  limit: number,
  isBackward: boolean,
): RelayEdgesPaginatedResult<T> {
  const hasExtra = items.length > limit;
  if (hasExtra) items = items.slice(0, limit);
  if (isBackward) items = [...items].reverse();

  return {
    edges: items.map((item) => ({
      node: item,
      cursor: encodeCursor(item.uuid),
    })),
    pageInfo: {
      hasNextPage: !isBackward && hasExtra,
      hasPreviousPage: isBackward && hasExtra,
      startCursor: items[0] ? encodeCursor(items[0].uuid) : null,
      endCursor: items[items.length - 1]
        ? encodeCursor(items[items.length - 1].uuid)
        : null,
    },
  };
}
