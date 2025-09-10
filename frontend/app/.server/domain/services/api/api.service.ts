import { NodeHttpClient } from '@effect/platform-node';
import { Effect, Layer } from 'effect';

import * as ApiClient from '~/.server/domain/services/api/api-client';
import type { City } from '~/.server/domain/services/api/api-client-types';
import { serverEnvironment } from '~/.server/environment';

/**
 * A live implementation of the `ApiConfig` layer.
 *
 * This layer provides the base URL for the API client from the server environment.
 */
const ApiClientConfig = Layer.succeed(ApiClient.Config, {
  baseUrl: serverEnvironment.VACMAN_API_BASE_URI,
});

/**
 * The live `ApiClient` layer.
 *
 * This layer composes the `ApiClientLive` implementation with its dependencies, providing a ready-to-use `ApiClient` service.
 */
const ApiClientLayer = ApiClient.layer.pipe(
  Layer.provide(ApiClientConfig), //
  Layer.provide(NodeHttpClient.layer),
);

/**
 * Runs an Effect program that requires the ApiClient service.
 *
 * This function provides the necessary layer (`ApiClientLayer`) and executes the effect, returning a `Promise` that resolves
 * with the effect's success value or rejects with its failure value.
 */
function run<A, E>(program: Effect.Effect<A, E, ApiClient.Client>): Promise<A> {
  return Effect.runPromise(Effect.provide(program, ApiClientLayer));
}

/**
 * The Effect program for fetching the list of cities.
 */
const getCitiesProgram = Effect.flatMap(ApiClient.Client, (apiClient) => apiClient.getCities());

/**
 * A service that provides methods for interacting with the VacMan API.
 *
 * This service acts as a bridge between the Effect-TS-based API client and the Promise-based world of route loaders. Each
 * method returns a `Promise`.
 */
export const apiService = {
  /**
   * Fetches a list of all available cities from the remote API.
   */
  getCities: (): Promise<readonly City[]> => run(getCitiesProgram),
};
