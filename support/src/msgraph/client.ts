import { HttpClient, HttpClientRequest, HttpClientResponse } from '@effect/platform';
import { Chunk, Duration, Effect } from 'effect';

import { MSGraphError } from '~/msgraph/errors';
import { AccessTokenResponse, BatchResponse, MSGraphUser, PagedResponse } from '~/msgraph/schemas';

/**
 * Max number of users per batch request. Enforced by Microsoft.
 *
 * @see https://learn.microsoft.com/en-us/graph/json-batching
 * @see https://learn.microsoft.com/en-us/graph/api/group-post-members
 */
const MAX_REQUESTS_PER_BATCH = 20;

/**
 * Standard timeout for API requests.
 */
const REQUEST_TIMEOUT = Duration.seconds(10);

///
/// Runnable effects
///

/**
 * Authenticates with Microsoft Entra ID using the client credentials flow. It
 * exchanges a client ID and client secret for an OAuth access token that can
 * be used to call the Microsoft Graph API.
 *
 * @param tenantId The ID of the Entra ID tenant (or 'organizations' for multi-tenant apps).
 * @param clientId The Application (client) ID for the registered application.
 * @param clientSecret The client secret for the registered application.
 * @param scope The scope of the requested access token (e.g., "https://graph.microsoft.com/.default").
 * @returns An `Effect` that yields the access token as a string, or fails with an `MSGraphError`.
 */
export const authenticate = (
  tenantId: string, //
  clientId: string,
  clientSecret: string,
  scope: string,
) =>
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;
    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    yield* Effect.logInfo('Initiating authentication');

    const request = HttpClientRequest.post(url).pipe(
      HttpClientRequest.bodyUrlParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: scope,
        grant_type: 'client_credentials',
      }),
    );

    return yield* httpClient.execute(request).pipe(
      Effect.timeout(REQUEST_TIMEOUT),
      Effect.tap((response) =>
        Effect.logTrace({
          headers: response.headers,
          status: response.status,
        }),
      ),
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.flatMap(HttpClientResponse.schemaBodyJson(AccessTokenResponse)),
      Effect.map((response) => response.access_token),
      Effect.tap((accessToken) => Effect.logTrace({ accessToken })),
      Effect.tap(() => Effect.logInfo('Successfully authenticated')),
    );
  }).pipe(
    Effect.withLogSpan('authenticate'), //
    Effect.annotateLogs({ tenantId, clientId, scope }),
    Effect.mapError((error) => new MSGraphError({ message: 'Failed to authenticate', error: error })),
  );

/**
 * Fetches the direct members of a Microsoft Graph group, returning only user objects.
 *
 * This function queries the `/groups/{groupId}/members` endpoint to get a list
 * of all immediate members. It does not include members of any nested groups.
 * It then filters this list to ensure only objects of type
 * `#microsoft.graph.user` are returned.
 *
 * ⚠️ **Important:** This implementation does not handle pagination and only
 * fetches the first page of up to 999 members. For groups with more members
 * than this, the results will be incomplete.
 *
 * @param authToken The OAuth2 bearer token for authenticating with Microsoft Graph.
 * @param groupId The unique ID (GUID) of the target Entra ID group.
 * @returns An `Effect` that yields an array of `MSGraphUser` objects on success, or fails
 *          with an `MSGraphError` if the API call is unsuccessful.
 */
export const getDirectGroupMembers = (
  authToken: string, //
  groupId: string,
) =>
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;
    const url = `https://graph.microsoft.com/v1.0/groups/${groupId}/members?$top=999`;

    yield* Effect.logInfo("Fetching group's direct members");

    const request = HttpClientRequest.get(url) //
      .pipe(HttpClientRequest.bearerToken(authToken));

    return yield* httpClient.execute(request).pipe(
      Effect.timeout(REQUEST_TIMEOUT),
      Effect.tap((response) =>
        Effect.logTrace({
          headers: response.headers,
          status: response.status,
        }),
      ),
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.flatMap(HttpClientResponse.schemaBodyJson(PagedResponse(MSGraphUser))),
      Effect.map(({ value }) => value.filter((member) => member['@odata.type'] === '#microsoft.graph.user')),
      Effect.tap((users) => Effect.logTrace({ users })),
      Effect.tap((users) => Effect.logInfo(`Group has ${users.length} direct members`)),
    );
  }).pipe(
    Effect.withLogSpan('getDirectGroupMembers'), //
    Effect.annotateLogs({ groupId }),
    Effect.mapError((error) => new MSGraphError({ message: `Failed to fetch members for group ${groupId}`, error: error })),
  );

/**
 * Fetches the transitive (nested) members of a Microsoft Graph group, returning only user objects.
 *
 * This function queries the `/groups/{groupId}/transitiveMembers` endpoint to
 * get a list of all members, including those in nested groups. It then filters
 * this list to ensure only objects of type `#microsoft.graph.user` are
 * returned, excluding other member types like Groups or Devices.
 *
 * ⚠️ **Important:** This implementation does not handle pagination and only
 * fetches the first page of up to 999 members. For groups with more members
 * than this, the results will be incomplete.
 *
 * @param authToken The OAuth2 bearer token for authenticating with Microsoft Graph.
 * @param groupId The unique ID (GUID) of the target Entra ID group.
 * @returns An `Effect` that yields an array of `MSGraphUser` objects on success, or fails
 *          with an `MSGraphError` if the API call is unsuccessful.
 */
export const getTransitiveGroupMembers = (
  authToken: string, //
  groupId: string,
) =>
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;
    const url = `https://graph.microsoft.com/v1.0/groups/${groupId}/transitiveMembers?$top=999`;

    yield* Effect.logInfo("Fetching group's transitive members");

    const request = HttpClientRequest.get(url) //
      .pipe(HttpClientRequest.bearerToken(authToken));

    return yield* httpClient.execute(request).pipe(
      Effect.timeout(REQUEST_TIMEOUT),
      Effect.tap((response) =>
        Effect.logTrace({
          headers: response.headers,
          status: response.status,
        }),
      ),
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.flatMap(HttpClientResponse.schemaBodyJson(PagedResponse(MSGraphUser))),
      Effect.map(({ value }) => value.filter((member) => member['@odata.type'] === '#microsoft.graph.user')),
      Effect.tap((users) => Effect.logTrace({ users })),
      Effect.tap((users) => Effect.logInfo(`Group has ${users.length} transitive members`)),
    );
  }).pipe(
    Effect.withLogSpan('getTransitiveGroupMembers'), //
    Effect.annotateLogs({ groupId }),
    Effect.mapError((error) => new MSGraphError({ message: `Failed to fetch members for group ${groupId}`, error: error })),
  );

/**
 * Adds a list of users to a Microsoft Graph group using parallel `PATCH` requests.
 *
 * This function efficiently adds members by splitting the user list into chunks
 * that respect the Graph API's limit of 20 members per request. Each chunk is
 * sent in a separate `PATCH` request concurrently using the `members@odata.bind`
 * property. This method does not use JSON batching. The function fails fast if
 * any single request fails.
 *
 * @param authToken The OAuth2 bearer token for authenticating with Microsoft Graph.
 * @param groupId The unique ID (GUID) of the target Entra ID group.
 * @param users An array of `MSGraphUser` objects to add as members of the group.
 * @returns An `Effect` that resolves with `void` if all members are added successfully,
 *          or fails with an `MSGraphError` if any request fails.
 */
export const addMembersToGroup = (
  authToken: string, //
  groupId: string,
  users: MSGraphUser[],
) =>
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;
    const url = `https://graph.microsoft.com/v1.0/groups/${groupId}`;

    yield* Effect.logInfo('Adding users to group');

    const mapUsersToDirectoryIds = (chunk: Chunk.Chunk<MSGraphUser>) => {
      return Chunk.map(chunk, (user) => `https://graph.microsoft.com/v1.0/directoryObjects/${user.id}`);
    };

    const userChunks = Chunk.chunksOf(Chunk.fromIterable(users), MAX_REQUESTS_PER_BATCH);

    const effects = userChunks.pipe(
      Chunk.map((userChunk, idx) => ({
        index: idx,
        size: Chunk.size(userChunk),
        request: HttpClientRequest.patch(url).pipe(
          HttpClientRequest.bearerToken(authToken),
          HttpClientRequest.bodyUnsafeJson({
            'members@odata.bind': Chunk.toArray(mapUsersToDirectoryIds(userChunk)),
          }),
        ),
      })),
      Chunk.map((userChunk, idx) =>
        httpClient.execute(userChunk.request).pipe(
          Effect.timeout(REQUEST_TIMEOUT),
          Effect.tap((response) =>
            Effect.logTrace({
              chunk: userChunk.index,
              headers: response.headers,
              status: response.status,
            }),
          ),
          Effect.flatMap(HttpClientResponse.filterStatusOk),
        ),
      ),
    );

    yield* Effect.all(effects, { concurrency: 'inherit' });
    yield* Effect.logInfo('Users added successfully', { total: users.length });
  }).pipe(
    Effect.withLogSpan('addMembersToGroup'), //
    Effect.annotateLogs({ groupId, users }),
    Effect.mapError((error) => new MSGraphError({ message: `Failed to add members to group`, error: error })),
  );

/**
 * Removes a list of users from a Microsoft Graph group using efficient JSON batching.
 *
 * This function prepares a DELETE operation for each user and then groups them
 * into chunks that respect the Graph API's batch size limit (`MAX_REQUESTS_PER_BATCH`).
 * Each chunk is sent as a single `POST` request to the `/v1.0/$batch` endpoint.
 * This is vastly more performant than sending individual DELETE requests.
 * The function fails fast if any removal operation within any batch fails.
 *
 * @param authToken The OAuth2 bearer token for authenticating with Microsoft Graph.
 * @param groupId The unique ID (GUID) of the target Entra ID group.
 * @param users An array of `MSGraphUser` objects to remove from the group.
 * @returns An `Effect` that resolves with `void` if all members are removed successfully,
 * or fails with an `MSGraphError` if any batch request fails.
 */
export const removeMembersFromGroup = (
  authToken: string, //
  groupId: string,
  users: MSGraphUser[],
) =>
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;
    const url = 'https://graph.microsoft.com/v1.0/$batch';

    yield* Effect.logInfo(`Removing ${users.length} users from group`);

    const requests = users.map((user) => ({
      id: user.id,
      method: 'DELETE',
      url: `/groups/${groupId}/members/${user.id}/$ref`,
    }));

    const requestChunks = Chunk.chunksOf(Chunk.fromIterable(requests), MAX_REQUESTS_PER_BATCH);

    const effects = requestChunks.pipe(
      Chunk.map((requestChunk, idx) => ({
        index: idx,
        size: Chunk.size(requestChunk),
        request: HttpClientRequest.post(url).pipe(
          HttpClientRequest.bearerToken(authToken),
          HttpClientRequest.bodyUnsafeJson({
            requests: Chunk.toArray(requestChunk),
          }),
        ),
      })),

      Chunk.map((requestChunk, idx) =>
        httpClient.execute(requestChunk.request).pipe(
          Effect.timeout(REQUEST_TIMEOUT),
          Effect.tap((response) =>
            Effect.logTrace({
              chunk: requestChunk.index,
              headers: response.headers,
              status: response.status,
            }),
          ),
          Effect.flatMap(HttpClientResponse.filterStatusOk),
          Effect.flatMap(HttpClientResponse.schemaBodyJson(BatchResponse)),
          Effect.flatMap(({ responses }) => {
            const failures = responses.filter((response) => response.status >= 400);
            return failures.length === 0
              ? Effect.logInfo('Chunk succeeded', { groupId, chunk: requestChunk.index, users: requestChunk.size })
              : Effect.fail(failures);
          }),
        ),
      ),
    );

    yield* Effect.all(effects, { concurrency: 'inherit' });
    yield* Effect.logInfo('Users removed successfully', { total: users.length });
  }).pipe(
    Effect.withLogSpan('removeMembersFromGroup'), //
    Effect.annotateLogs({ groupId, userCount: users.length }),
    Effect.mapError((error) => new MSGraphError({ message: 'Failed to remove members from group', error: error })),
  );
