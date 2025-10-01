import type { ErrorCode } from '~/errors/error-codes';
import { ErrorCodes } from '~/errors/error-codes';
import type { HttpStatusCode } from '~/errors/http-status-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { generateCorrelationId } from '~/utils/correlation';

// Use a dynamic access to avoid bundling server-only modules in the client.
// When running server-side, globalThis.__vacmanGetReqId will be set by the server utils.

type GlobalWithReqId = typeof globalThis & { __vacmanGetReqId?: () => string };

type AppErrorOptions = {
  correlationId?: string;
  httpStatusCode?: HttpStatusCode;
};

/**
 * A generic, top-level error that all application errors should extend.
 * This class *does not* extend Error because React Router will sanitize all Errors when sending them to the client.
 */
export class AppError {
  public readonly name = 'AppError';

  public readonly errorCode: ErrorCode;
  public readonly correlationId: string;
  public readonly stack?: string;
  public readonly httpStatusCode: HttpStatusCode;

  // note: this is intentionally named `msg` instead
  // of `message` to workaround an issue with winston
  // always logging this as the log message when a
  // message is supplied to `log.error(message, error)`
  public readonly msg: string;

  // compatibility getter for standard Error interface
  public get message(): string {
    return this.msg;
  }

  public constructor(msg: string, errorCode: ErrorCode = ErrorCodes.UNCAUGHT_ERROR, opts?: AppErrorOptions) {
    this.errorCode = errorCode;
    this.msg = msg;

    // Prefer explicit correlationId, then request-scoped reqId, then random fallback
    const getReqId = (globalThis as GlobalWithReqId).__vacmanGetReqId;
    const requestReqId: string | undefined = typeof getReqId === 'function' ? getReqId() : undefined;
    this.correlationId = opts?.correlationId ?? requestReqId ?? generateCorrelationId();
    this.httpStatusCode = opts?.httpStatusCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR;

    try {
      Error.captureStackTrace(this, this.constructor);
    } catch {
      // Stack trace capture is not available in this environment
    }
  }
}

/**
 * Type guard to check if an error is a AppError.
 *
 * Note: this function does not use `instanceof` because the type
 *       information is lost when shipped to the client
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof Object && 'name' in error && error.name === 'AppError';
}
