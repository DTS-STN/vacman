import { Data } from 'effect';

export class ApiError extends Data.TaggedError('@app/ApiError')<{
  readonly cause: unknown;
  readonly description: string;
  readonly method: string;
  readonly module: string;
}> {}
