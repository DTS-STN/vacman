import type { Result } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import { serverEnvironment } from '~/.server/environment';
import { LogFactory, msSince } from '~/.server/logging';
import { getRequestContext } from '~/.server/utils/request-context';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import type { HttpStatusCode } from '~/errors/http-status-codes';
import { generateCorrelationId } from '~/utils/correlation';

const logger = LogFactory.getRequestLogger('api-client');

type baseFetchOptions = {
  accessToken?: string;
  body?: BodyInit;
};
/**
 * Centralized API request logic.
 * Performs the raw fetch and handles network/HTTP status errors.
 * This is an internal helper function for the apiClient.
 * @param path The API endpoint path.
 * @param context A descriptive string for the action being performed, used in error messages.
 * @returns A Promise that resolves to Result containing the raw Response object or an AppError non-successful HTTP responses (e.g., 500, 401).
 * @throws {AppError} for network failures or DNS errors etc.
 */
async function baseFetch(
  path: string,
  context: string,
  method: string,
  options?: baseFetchOptions,
): Promise<Result<Response, AppError>> {
  const reqId = getRequestContext()?.reqId ?? generateCorrelationId();
  try {
    const started = Date.now();
    const cleanBase = serverEnvironment.VACMAN_API_BASE_URI.endsWith('/')
      ? serverEnvironment.VACMAN_API_BASE_URI.slice(0, -1)
      : serverEnvironment.VACMAN_API_BASE_URI;

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const finalUrl = `${cleanBase}/${cleanPath}`;

    logger.debug('api.request', {
      reqId,
      method,
      url: finalUrl,
      context,
    });

    const response = await fetch(finalUrl, {
      method: method,
      headers: {
        'Authorization': options?.accessToken ? `Bearer ${options.accessToken}` : '',
        'Content-Type': 'application/json',
        'x-correlation-id': reqId,
      },
      body: options?.body ?? undefined,
    });

    if (!response.ok) {
      logger.warn('api.response.error', {
        reqId,
        method,
        url: finalUrl,
        status: response.status,
        statusText: response.statusText,
        context,
        durationMs: msSince(started),
      });
      return Err(
        new AppError(
          `Failed to ${context.toLowerCase()}. The server responded with status ${response.status}.`,
          ErrorCodes.VACMAN_API_ERROR,
          { httpStatusCode: response.status as HttpStatusCode, correlationId: reqId },
        ),
      );
    }

    logger.debug('api.response.ok', {
      reqId,
      method,
      url: finalUrl,
      status: response.status,
      context,
      durationMs: msSince(started),
    });
    return Ok(response);
  } catch (error) {
    logger.error('api.network.error', {
      reqId,
      method,
      path,
      context,
      error,
    });
    return Err(
      new AppError(
        `A network error occurred while trying to ${context.toLowerCase()}: ${String(error)}`,
        ErrorCodes.VACMAN_API_ERROR,
        { correlationId: reqId },
      ),
    );
  }
}

export const apiClient = {
  /**
   * Fetches data from a given path and parses it as JSON.
   * @template TResponseData The expected type of the data in the successful response.
   * @param {string} path The API endpoint path.
   * @param {string} context A descriptive string for the action, used in error messages.
   * @param {string} [token] An optional access token for authorization.
   * @returns {Promise<Result<TResponseData, AppError>>} A Promise resolving to a Result containing the typed response data or an AppError.
   */
  async get<TResponseData>(path: string, context: string, token?: string): Promise<Result<TResponseData, AppError>> {
    const responseResult = await baseFetch(path, context, 'GET', { accessToken: token });
    if (responseResult.isErr()) {
      logger.warn('api.get.failed', { path, context, error: responseResult.unwrapErr() });
      return responseResult;
    }

    const response = responseResult.unwrap();
    try {
      const data = (await response.json()) as TResponseData;
      logger.debug('api.get.parsed', { path, context });
      return Ok(data);
    } catch (parsingError) {
      logger.error('api.get.parse.error', { path, context, error: parsingError });
      return Err(
        new AppError(
          `Failed to parse JSON response on '${context.toLowerCase()}': ${String(parsingError)}`,
          ErrorCodes.VACMAN_API_ERROR,
        ),
      );
    }
  },

  /**
   * Sends data to a given path using the POST method.
   * @template TRequestData The type of the data being sent in the request body.
   * @template TResponseData The expected type of the data in the successful response.
   * @param {string} path The API endpoint path.
   * @param {string} context A descriptive string for the action, used in error messages.
   * @param {string} [token] An optional access token for authorization.
   * @param {TRequestData} [model] The data to be sent in the request body.
   * @returns {Promise<Result<TResponseData, AppError>>} A Promise resolving to a Result containing the typed response data or an AppError.
   */
  async post<TRequestData, TResponseData = unknown>(
    path: string,
    context: string,
    data: TRequestData,
    token?: string,
  ): Promise<Result<TResponseData, AppError>> {
    const responseResult = await baseFetch(path, context, 'POST', { accessToken: token, body: JSON.stringify(data) });
    if (responseResult.isErr()) {
      logger.warn('api.post.failed', { path, context, error: responseResult.unwrapErr() });
      return responseResult;
    }

    const response = responseResult.unwrap();
    try {
      const data = (await response.json()) as TResponseData;
      logger.debug('api.post.parsed', { path, context });
      return Ok(data);
    } catch (parsingError) {
      logger.error('api.post.parse.error', { path, context, error: parsingError });
      return Err(
        new AppError(
          `Failed to parse JSON response on '${context.toLowerCase()}': ${String(parsingError)}`,
          ErrorCodes.VACMAN_API_ERROR,
        ),
      );
    }
  },

  /**
   * Updates data at a given path using the PUT method.
   * @template TRequestData The type of the data being sent in the request body.
   * @template TResponseData The expected type of the data in the successful response.
   * @param {string} path The API endpoint path.
   * @param {string} context A descriptive string for the action, used in error messages.
   * @param {string} [token] An optional access token for authorization.
   * @param {TRequestData} [model] The data to be sent in the request body.
   * @returns {Promise<Result<TResponseData, AppError>>} A Promise resolving to a Result containing the typed response data or an AppError.
   */
  async put<TRequestData, TResponseData = unknown>(
    path: string,
    context: string,
    data: TRequestData,
    token?: string,
  ): Promise<Result<TResponseData, AppError>> {
    const responseResult = await baseFetch(path, context, 'PUT', { accessToken: token, body: JSON.stringify(data) });
    if (responseResult.isErr()) {
      logger.warn('api.put.failed', { path, context, error: responseResult.unwrapErr() });
      return responseResult;
    }

    const response = responseResult.unwrap();
    try {
      // Some endpoints (e.g., 202 Accepted or 204 No Content) legitimately return an empty body.
      // Attempting response.json() on an empty body throws a SyntaxError, so we read text first.
      const text = await response.text();
      if (!text.trim()) {
        // Return undefined (or null) as the typed response when no body is present.
        logger.debug('api.put.no-content', { path, context });
        return Ok(undefined as TResponseData);
      }
      const parsed = JSON.parse(text) as TResponseData;
      logger.debug('api.put.parsed', { path, context });
      return Ok(parsed);
    } catch (parsingError) {
      logger.error('api.put.parse.error', { path, context, error: parsingError });
      return Err(
        new AppError(
          `Failed to parse JSON response on '${context.toLowerCase()}': ${String(parsingError)}`,
          ErrorCodes.VACMAN_API_ERROR,
        ),
      );
    }
  },

  /**
   * Deletes a resource at a given path.
   * @template TRequestData The type of the data being sent in the optional request body.
   * @template TResponseData The expected type of the data in the successful response. Can be `null` for empty responses.
   * @param {string} path The API endpoint path.
   * @param {string} context A descriptive string for the action, used in error messages.
   * @param {string} [token] An optional access token for authorization.
   * @param {TRequestData} [model] An optional request body to send with the DELETE request.
   * @returns {Promise<Result<TResponseData, AppError>>} A Promise resolving to a Result containing the typed response data or an AppError.
   */
  async delete<TRequestData, TResponseData = unknown>(
    path: string,
    context: string,
    data?: TRequestData,
    token?: string,
  ): Promise<Result<TResponseData, AppError>> {
    const jsonBody = data ? JSON.stringify(data) : undefined;
    const responseResult = await baseFetch(path, context, 'DELETE', { accessToken: token, body: jsonBody });
    if (responseResult.isErr()) {
      logger.warn('api.delete.failed', { path, context, error: responseResult.unwrapErr() });
      return responseResult;
    }

    const response = responseResult.unwrap();
    try {
      // The JSON from the response should be parsed as the response type.
      // Handle empty responses, common for DELETE requests.
      const text = await response.text();
      const parsed = text ? (JSON.parse(text) as TResponseData) : (null as TResponseData);
      logger.debug(text ? 'api.delete.parsed' : 'api.delete.no-content', { path, context });
      return Ok(parsed);
    } catch (parsingError) {
      logger.error('api.delete.parse.error', { path, context, error: parsingError });
      return Err(
        new AppError(
          `Failed to parse JSON response on '${context.toLowerCase()}': ${String(parsingError)}`,
          ErrorCodes.VACMAN_API_ERROR,
        ),
      );
    }
  },
};
