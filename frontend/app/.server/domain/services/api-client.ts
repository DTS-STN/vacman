import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import type { HttpStatusCode } from '~/errors/http-status-codes';

/**
 * Centralized API request logic.
 * This function handles the fetch call and basic error checking.
 * It will throw an AppError for network failures or non-successful HTTP responses (e.g., 500, 401).
 * The caller is responsible for handling specific status codes like 404 if needed and for parsing the response body.
 * @param path The API endpoint path.
 * @param context A descriptive string for the action being performed, used in error messages.
 * @returns A Promise that resolves to the Response object on success.
 * @throws {AppError} if the fetch call fails or if the server returns a non-ok status.
 */
export async function apiFetch(path: string, context: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}${path}`);
  } catch (error) {
    // Network errors, DNS errors, etc.
    throw new AppError(
      `A network error occurred while trying to ${context.toLowerCase()}: ${String(error)}`,
      ErrorCodes.VACMAN_API_ERROR,
    );
  }

  if (!response.ok) {
    // API returned a non-successful status code (4xx, 5xx)
    throw new AppError(
      `Failed to ${context.toLowerCase()}. The server responded with status ${response.status}.`,
      ErrorCodes.VACMAN_API_ERROR,
      { httpStatusCode: response.status as HttpStatusCode },
    );
  }

  return response;
}
