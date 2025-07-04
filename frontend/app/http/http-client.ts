import type { Logger } from 'winston';

import { LogFactory } from '~/.server/logging';
import { AppError, isAppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

/**
 * Options for configuring a custom fetch function.
 */
export type FetchOptions = RequestInit & {
  /**
   * The proxy URL to be used for HTTP requests.
   * If provided, the fetch function will use this proxy.
   */
  proxyUrl?: string;

  /**
   * Timeout value (in milliseconds) for the fetch requests.
   * If not provided, a default timeout may be used.
   */
  timeout?: number;
};

/**
 * TODO Service interface for managing HTTP requests with optional instrumentation and proxy support.
 */

export interface HttpClient {
  /* simple fetch function that can be used for making HTTP requests.
   * @param metricPrefix - The prefix used for instrumentation metrics.
   * @param input - The input for the HTTP request, which can be a URL or a `RequestInfo` object.
   * @param options - fetch options, {headers, proxyUrl, method, ... etc.}
   * @returns A promise that resolves with the `Response` object from the HTTP request.
   * @throws Will throw an error if the HTTP request fails.
   */
  simpleFetch(metricPrefix: string, input: RequestInfo | URL, options: FetchOptions): Promise<Response>;
}

export class DefaultHttpClient implements HttpClient {
  private readonly log: Logger;

  constructor() {
    this.log = LogFactory.getLogger('DefaultHttpClient');
  }

  async simpleFetch(metricPrefix: string, input: RequestInfo | URL, options: FetchOptions): Promise<Response> {
    this.log.debug(
      'Executing instumented fetch function; metricPrefix: [%s], input: [%s], options: [%j]',
      metricPrefix,
      input,
      options,
    );

    //console.log('http-client:input =', input);
    //console.log('http-client:options =', options);

    try {
      const response = await fetch(`${input}`, { ...options });

      //console.log('http-client: fetch result =', response.status, await response.json())

      this.log.trace('HTTP request completed; metricPrefix: [%s]; status: [%d]', metricPrefix, response.status);

      return response;
    } catch (error) {
      if (!isAppError(error)) {
        new AppError(`${metricPrefix}`, ErrorCodes.XAPI_NETWORK_500_ERROR);
      }
      throw error;
    }
  }
}
