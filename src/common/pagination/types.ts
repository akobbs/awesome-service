export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface RelayEdgesPaginatedResult<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
}

export interface RelayPaginationInput {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
}

export type CursorDirection =
  | { direction: 'forward'; after?: string; before?: never }
  | { direction: 'backward'; before?: string; after?: never };
