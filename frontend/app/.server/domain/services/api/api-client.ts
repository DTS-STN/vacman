/**
 * @module ApiClient
 *
 * This module defines the `ApiClient` service, its configuration (`ApiConfig`), and the live implementation (`ApiClientLive`)
 * for interacting with an external API. It abstracts away HTTP requests and provides a cleaninterface.
 */
import { HttpClient, HttpClientRequest, HttpClientResponse } from '@effect/platform';
import { Context, Effect, Layer, Schedule } from 'effect';

import type { City } from '~/.server/domain/services/api/api-client-types';
import { CitySchema, ContentResponseSchema } from '~/.server/domain/services/api/api-client-types';
import { ApiError } from '~/.server/domain/services/api/api-errors';

/**
 * Provides configuration for the ApiClient, specifically the base URL.
 */
export class Config extends Context.Tag('@app/ApiConfig')<
  Config,
  {
    readonly baseUrl: string;
  }
>() {}

/**
 * Defines the contract for a client that interacts with an external API.
 *
 * This service provides methods for fetching data, abstracting away the underlying HTTP requests and error handling.
 */
export class Client extends Context.Tag('@app/ApiClient')<
  Client,
  {
    /**
     * Fetches a list of all available cities from the remote API.
     */
    readonly getCities: () => Effect.Effect<readonly City[], ApiError>;
  }
>() {}

/**
 * The core implementation effect for the ApiClient service.
 *
 * This effect constructs the `ApiClient` by resolving its dependencies (`ApiConfig`, `HttpClient`) from the context and wiring
 * them together. It is not intended to be used directly, but rather to be provided to a `Layer`.
 */
export const make = Effect.gen(function* () {
  const apiConfig = yield* Config;

  const httpClient = (yield* HttpClient.HttpClient).pipe(
    // request mappings that apply to *all* client requests
    HttpClient.mapRequest(HttpClientRequest.prependUrl(apiConfig.baseUrl)),
    HttpClient.mapRequest(HttpClientRequest.setHeader('Content-Type', 'application/json')),
    HttpClient.retryTransient({
      schedule: Schedule.exponential('250 millis'),
      times: 3,
    }),
  );

  return Client.of({
    getCities: () =>
      httpClient.get('/v1/codes/cities').pipe(
        Effect.flatMap(HttpClientResponse.schemaBodyJson(ContentResponseSchema(CitySchema))),
        Effect.map((response) => response.content),
        Effect.mapError(
          (cause) =>
            new ApiError({
              module: 'ApiClient',
              method: 'getCities',
              description: cause.message,
              cause: cause,
            }),
        ),
        Effect.withLogSpan('ApiClient.getCities'),
      ),
  });
});

/**
 * The "live" layer that provides the `ApiClient` service to the application.
 *
 * This layer encapsulates the creation of the `ApiClient`, using the `make` effect. It satisfies the `ApiClient` requirement,
 * but in turn requires `ApiConfig` and `HttpClient` to be provided in the context. This is the default, production-ready
 * implementation.
 */
export const layer = Layer.effect(Client, make);
