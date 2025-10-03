import { Data } from 'effect';

/**
 * A custom error type for failures related to the Microsoft Graph API. This
 * class extends `Data.TaggedError` to provide a structured way to represent
 * errors, capturing the original error and an optional descriptive message.
 */
export class MSGraphError extends Data.TaggedError('@support/MSGraphError')<{
  readonly error: unknown;
  readonly message?: string;
}> {}
