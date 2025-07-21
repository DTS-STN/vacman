import type { Result } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import type { HttpStatusCode } from '~/errors/http-status-codes';

/**
 * Centralized API request logic.
 * Performs the raw fetch and handles network/HTTP status errors.
 * This is an internal helper function for the apiClient.
 * @param path The API endpoint path.
 * @param context A descriptive string for the action being performed, used in error messages.
 * @returns A Promise that resolves to Result containing the raw Response object or an AppError non-successful HTTP responses (e.g., 500, 401).
 * @throws {AppError} for network failures or DNS errors etc.
 */
async function baseFetch(path: string, context: string): Promise<Result<Response, AppError>> {
  try {
    const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}${path}`);

    // Check for non-successful status codes (4xx, 5xx)
    if (!response.ok) {
      return Err(
        new AppError(
          `Failed to ${context.toLowerCase()}. The server responded with status ${response.status}.`,
          ErrorCodes.VACMAN_API_ERROR,
          { httpStatusCode: response.status as HttpStatusCode },
        ),
      );
    }

    return Ok(response);
  } catch (error) {
    // Network errors, DNS errors, etc.
    return Err(
      new AppError(
        `A network error occurred while trying to ${context.toLowerCase()}: ${String(error)}`,
        ErrorCodes.VACMAN_API_ERROR,
      ),
    );
  }
}

export const apiClient = {
  /**
   * Fetches data from a given path and parses it as JSON.
   * @param T The expected type of the JSON response.
   * @param path The API endpoint path.
   * @param context A descriptive string for the action, used in error messages.
   * @returns A Promise resolving to a Result containing the typed data (T) or an AppError.
   */
  async get<T>(path: string, context: string): Promise<Result<T, AppError>> {
    // Get the raw response using our base fetcher
    const responseResult = await baseFetch(path, context);

    if (responseResult.isErr()) {
      return responseResult; // Pass through network/HTTP errors
    }

    const response = responseResult.unwrap();

    // Try to parse the JSON, handling any parsing errors
    try {
      const data = (await response.json()) as T;
      return Ok(data);
    } catch (parsingError) {
      return Err(
        new AppError(
          `Failed to parse JSON response on '${context.toLowerCase()}': ${String(parsingError)}`,
          ErrorCodes.VACMAN_API_ERROR,
        ),
      );
    }
  },

  // TODO: add post, put, delete methods here in the future following the same pattern.
};
