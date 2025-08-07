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
async function baseFetch(
  path: string,
  context: string,
  method: string,
  token?: string,
  jsonBody?: string,
): Promise<Result<Response, AppError>> {
  try {
    const cleanBase = serverEnvironment.VACMAN_API_BASE_URI.endsWith('/')
      ? serverEnvironment.VACMAN_API_BASE_URI.slice(0, -1)
      : serverEnvironment.VACMAN_API_BASE_URI;

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const finalUrl = `${cleanBase}/${cleanPath}`;

    const response = await fetch(finalUrl, {
      method: method,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: jsonBody ?? undefined,
    });

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
   * Fetches data and parses it as JSON. The response is the only generic type.
   */
  async get<TResponseData>(path: string, context: string, token?: string): Promise<Result<TResponseData, AppError>> {
    const responseResult = await baseFetch(path, context, 'GET', token);
    if (responseResult.isErr()) {
      return responseResult;
    }

    const response = responseResult.unwrap();
    try {
      const data = (await response.json()) as TResponseData;
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

  /**
   * Sends data via POST. Uses separate types for the request body and the expected response.
   */
  async post<TRequestData, TResponseData>(
    path: string,
    context: string,
    token?: string,
    model?: TRequestData,
  ): Promise<Result<TResponseData, AppError>> {
    const responseResult = await baseFetch(path, context, 'POST', token, JSON.stringify(model));
    if (responseResult.isErr()) {
      return responseResult;
    }

    const response = responseResult.unwrap();
    try {
      const data = (await response.json()) as TResponseData;
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

  /**
   * Sends data via PUT. Uses separate types for the request body and the expected response.
   */
  async put<TRequestData, TResponseData>(
    path: string,
    context: string,
    token?: string,
    model?: TRequestData,
  ): Promise<Result<TResponseData, AppError>> {
    const responseResult = await baseFetch(path, context, 'PUT', token, JSON.stringify(model));
    if (responseResult.isErr()) {
      return responseResult;
    }

    const response = responseResult.unwrap();
    try {
      const data = (await response.json()) as TResponseData;
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

  /**
   * Sends a DELETE request. Allows for an optional request body and an expected response type.
   */
  async delete<TRequestData, TResponseData>(
    path: string,
    context: string,
    token?: string,
    model?: TRequestData,
  ): Promise<Result<TResponseData, AppError>> {
    const jsonBody = model ? JSON.stringify(model) : undefined;
    const responseResult = await baseFetch(path, context, 'DELETE', token, jsonBody);
    if (responseResult.isErr()) {
      return responseResult;
    }

    const response = responseResult.unwrap();
    try {
      // The JSON from the response should be parsed as the response type.
      // Handle empty responses, common for DELETE requests.
      const text = await response.text();
      const data = text ? (JSON.parse(text) as TResponseData) : (null as TResponseData);
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
};
