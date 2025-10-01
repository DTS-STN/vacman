import type { HttpClientRequest } from '@effect/platform';
import { HttpClient, HttpClientResponse } from '@effect/platform';
import { describe, it } from '@effect/vitest';
import { Effect, Exit, Layer, Ref } from 'effect';

import * as MSGraphClient from '~/msgraph/client';

/**
 * Test suite for the MSGraphClient module.
 *
 * These tests validate the integration logic with the Microsoft Graph API by
 * simulating responses through a mock HttpClient. This allows us to verify
 * authentication, group membership queries, and add/remove operations without
 * making real API calls.
 *
 * Key testing patterns used:
 *   - Mock HTTP responses to simulate various API scenarios
 *   - Effect.exit to capture both success and failure cases
 *   - Ref counters to verify the number of requests made (useful for batch
 *     operations)
 */
describe('msgraph-client', () => {
  // Shared test constants - using UUIDs to simulate real MS Graph identifiers
  const MOCK_ACCESS_TOKEN = '00000000-0000-0000-0000-000000000000';
  const MOCK_AUTH_TOKEN = '00000000-0000-0000-0000-000000000000';
  const MOCK_GROUP_ID = '00000000-0000-0000-0000-000000000000';

  /**
   * Creates a mock HttpClient layer with a custom request handler.
   *
   * This utility allows each test to define its own response behavior without
   * duplicating the Layer creation logic. The handler function receives the
   * HTTP request and should return an Effect that yields a standard Response
   * object.
   */
  const makeMockHttpClient = (handler: (request: HttpClientRequest.HttpClientRequest) => Effect.Effect<Response>) =>
    Layer.succeed(
      HttpClient.HttpClient,
      HttpClient.make((request) =>
        handler(request) //
          .pipe(Effect.map((response) => HttpClientResponse.fromWeb(request, response))),
      ),
    );

  /**
   * Utility to create an array of mock Graph user objects.
   *
   * Generates user objects that match the structure returned by MS Graph API.
   * This keeps tests focused on logic rather than manual object construction.
   */
  const makeMockUsers = (len: number) =>
    Array.from({ length: len }, (_, i) => ({
      '@odata.type': '#microsoft.graph.user',
      'id': `user-id-${i + 1}`,
      'displayName': `Test User ${i + 1}`,
    }));

  //
  // ────────────────────────────────
  // authenticate()
  // ────────────────────────────────
  //
  describe('authenticate', () => {
    it.effect('should return an access token on successful authentication', ({ expect }) =>
      Effect.gen(function* () {
        // Simulate successful OAuth token response from MS Graph
        const mockHttp = makeMockHttpClient(
          () => Effect.succeed(new Response(JSON.stringify({ access_token: MOCK_ACCESS_TOKEN }), { status: 200 })), //
        );

        // Test the authentication flow and capture the result
        const result = yield* MSGraphClient.authenticate('tenantId', 'clientId', 'clientSecret', 'scope').pipe(
          Effect.provide(mockHttp),
        );

        expect(result).toEqual(MOCK_ACCESS_TOKEN);
      }),
    );

    it.effect('should fail on non-2xx response', ({ expect }) =>
      Effect.gen(function* () {
        // Simulate authentication failure (e.g., invalid credentials)
        const mockHttp = makeMockHttpClient(
          () => Effect.succeed(new Response('Invalid request', { status: 400 })), //
        );

        const result = yield* MSGraphClient.authenticate('tenantId', 'clientId', 'clientSecret', 'scope').pipe(
          Effect.provide(mockHttp),
          Effect.exit,
        );

        // Verify that the failure is properly wrapped in an MSGraphError
        expect(result).toMatchObject(
          Exit.fail({
            _tag: '@support/MSGraphError',
            message: 'Failed to authenticate',
          }),
        );
      }),
    );

    it.effect('should fail on JSON parsing error', ({ expect }) =>
      Effect.gen(function* () {
        // Simulate malformed response that can't be parsed as JSON
        const mockHttp = makeMockHttpClient(
          () => Effect.succeed(new Response('not json', { status: 200 })), //
        );

        const result = yield* MSGraphClient.authenticate('tenantId', 'clientId', 'clientSecret', 'scope').pipe(
          Effect.provide(mockHttp),
          Effect.exit,
        );

        // Even with 200 status, JSON parsing failure should result in error
        expect(result).toMatchObject(
          Exit.fail({
            _tag: '@support/MSGraphError',
            message: 'Failed to authenticate',
          }),
        );
      }),
    );
  });

  //
  // ────────────────────────────────
  // getDirectGroupMembers()
  // ────────────────────────────────
  //
  describe('getDirectGroupMembers', () => {
    it.effect('should return an array of users for a valid group id', ({ expect }) =>
      Effect.gen(function* () {
        const users = makeMockUsers(100);

        // Simulate MS Graph API response with user collection
        const mockHttp = makeMockHttpClient(
          () => Effect.succeed(new Response(JSON.stringify({ value: users }), { status: 200 })), //
        );

        const result = yield* MSGraphClient.getDirectGroupMembers(MOCK_AUTH_TOKEN, MOCK_GROUP_ID).pipe(
          Effect.provide(mockHttp),
          Effect.exit,
        );

        expect(result).toEqual(Exit.succeed(users));
      }),
    );

    it.effect('should correctly filter out non-user members from the response', ({ expect }) =>
      Effect.gen(function* () {
        const users = makeMockUsers(100);

        // MS Graph can return mixed member types (users, groups, devices, etc.)
        // Our client should filter to only return user objects
        const mockResponse = {
          value: [
            ...users,
            { '@odata.type': '#microsoft.graph.group', 'id': 'group-1', 'displayName': 'Sub Group' },
            { '@odata.type': '#microsoft.graph.device', 'id': 'device-1', 'displayName': 'Test Device' },
          ],
        };

        const mockHttp = makeMockHttpClient(
          () => Effect.succeed(new Response(JSON.stringify(mockResponse), { status: 200 })), //
        );

        const result = yield* MSGraphClient.getDirectGroupMembers(MOCK_AUTH_TOKEN, MOCK_GROUP_ID).pipe(
          Effect.provide(mockHttp),
        );

        // Should only return the user objects, filtering out groups and devices
        expect(result).toEqual(users);
      }),
    );

    it.effect('should return an empty array for a group with no members', ({ expect }) =>
      Effect.gen(function* () {
        // Test edge case of empty group
        const mockHttp = makeMockHttpClient(
          () => Effect.succeed(new Response(JSON.stringify({ value: [] }), { status: 200 })), //
        );

        const result = yield* MSGraphClient.getDirectGroupMembers(MOCK_AUTH_TOKEN, MOCK_GROUP_ID).pipe(
          Effect.provide(mockHttp),
        );

        expect(result).toEqual([]);
      }),
    );

    it.effect('should fail with an MSGraphError for an invalid group ID or failed request', ({ expect }) =>
      Effect.gen(function* () {
        // Simulate 404 response for non-existent group
        const mockHttp = makeMockHttpClient(
          () => Effect.succeed(new Response('Not Found', { status: 404 })), //
        );

        const result = yield* MSGraphClient.getDirectGroupMembers(MOCK_AUTH_TOKEN, 'invalid-group-id').pipe(
          Effect.provide(mockHttp),
          Effect.exit,
        );

        expect(result).toMatchObject(
          Exit.fail({
            _tag: '@support/MSGraphError',
            message: 'Failed to fetch members for group invalid-group-id',
          }),
        );
      }),
    );
  });

  //
  // ────────────────────────────────
  // getTransitiveGroupMembers()
  // ────────────────────────────────
  //
  describe('getTransitiveGroupMembers', () => {
    it.effect('should return an array of all nested users for a valid group ID', ({ expect }) =>
      Effect.gen(function* () {
        const mockUsers = makeMockUsers(100);

        const mockHttp = makeMockHttpClient(
          () => Effect.succeed(new Response(JSON.stringify({ value: mockUsers }), { status: 200 })), //
        );

        const result = yield* MSGraphClient.getTransitiveGroupMembers(MOCK_AUTH_TOKEN, MOCK_GROUP_ID).pipe(
          Effect.provide(mockHttp),
        );

        expect(result).toEqual(mockUsers);
      }),
    );

    it.effect('should return an empty array for a group with no transitive members', ({ expect }) =>
      Effect.gen(function* () {
        // Edge case: group with no members at any nesting level
        const mockHttp = makeMockHttpClient(
          () => Effect.succeed(new Response(JSON.stringify({ value: [] }), { status: 200 })), //
        );

        const result = yield* MSGraphClient.getTransitiveGroupMembers(MOCK_AUTH_TOKEN, MOCK_GROUP_ID).pipe(
          Effect.provide(mockHttp),
        );

        expect(result).toEqual([]);
      }),
    );

    it.effect('should fail with an MSGraphError for an invalid group ID or failed request', ({ expect }) =>
      Effect.gen(function* () {
        const mockHttp = makeMockHttpClient(() => Effect.succeed(new Response('Not Found', { status: 404 })));

        const result = yield* MSGraphClient.getTransitiveGroupMembers(MOCK_AUTH_TOKEN, 'invalid-group-id').pipe(
          Effect.provide(mockHttp),
          Effect.exit,
        );

        expect(result).toMatchObject(
          Exit.fail({
            _tag: '@support/MSGraphError',
            message: 'Failed to fetch members for group invalid-group-id',
          }),
        );
      }),
    );
  });

  //
  // ────────────────────────────────
  // addMembersToGroup()
  // ────────────────────────────────
  //
  describe('addMembersToGroup', () => {
    it.effect('should succeed when adding a number of users within a single batch limit', ({ expect }) =>
      Effect.gen(function* () {
        // Track request count to verify batching behavior
        const requestCount = yield* Ref.make(0);
        const users = makeMockUsers(10); // 10 users should fit in a single batch (limit is typically 20)

        const mockHttp = makeMockHttpClient(
          () => Ref.update(requestCount, (n) => n + 1).pipe(Effect.as(new Response(null, { status: 204 }))), //
        );

        yield* MSGraphClient.addMembersToGroup(MOCK_AUTH_TOKEN, MOCK_GROUP_ID, users).pipe(Effect.provide(mockHttp));

        // Should only make one request since we're under the batch limit
        expect(yield* Ref.get(requestCount)).toEqual(1);
      }),
    );

    it.effect('should succeed when adding users that require multiple batches', ({ expect }) =>
      Effect.gen(function* () {
        const requestCount = yield* Ref.make(0);
        const users = makeMockUsers(50); // 50 users will require 3 batches (20, 20, 10) assuming batch size of 20

        const mockHttp = makeMockHttpClient(
          () => Ref.update(requestCount, (n) => n + 1).pipe(Effect.as(new Response(null, { status: 204 }))), //
        );

        yield* MSGraphClient.addMembersToGroup(MOCK_AUTH_TOKEN, MOCK_GROUP_ID, users).pipe(Effect.provide(mockHttp));

        // Verify that the correct number of batch requests were made
        expect(yield* Ref.get(requestCount)).toEqual(3);
      }),
    );

    it.effect('should succeed without making any requests when adding an empty array of users', ({ expect }) =>
      Effect.gen(function* () {
        const requestCount = yield* Ref.make(0);

        const mockHttp = makeMockHttpClient(
          () =>
            Ref.update(requestCount, (n) => n + 1) //
              .pipe(Effect.as(new Response(null, { status: 204 }))), //
        );

        // Edge case: adding no users should be a no-op
        yield* MSGraphClient.addMembersToGroup(MOCK_AUTH_TOKEN, MOCK_GROUP_ID, []).pipe(Effect.provide(mockHttp));

        // No HTTP requests should be made for empty user array
        expect(yield* Ref.get(requestCount)).toEqual(0);
      }),
    );

    it.effect('should fail with an MSGraphError if any batch PATCH request fails', ({ expect }) =>
      Effect.gen(function* () {
        const requestCount = yield* Ref.make(0);
        const users = makeMockUsers(50); // 50 users will require 3 batches (20, 20, 10) assuming batch size of 20

        // Simulate failure on the second batch request to test error handling
        const mockHttp = makeMockHttpClient(() =>
          Ref.getAndUpdate(requestCount, (n) => n + 1).pipe(
            Effect.flatMap(
              (n) =>
                n === 1
                  ? Effect.succeed(new Response('Bad request', { status: 400 })) // Fail on second request
                  : Effect.succeed(new Response(null, { status: 204 })), // Succeed on other requests
            ),
          ),
        );

        const result = yield* MSGraphClient.addMembersToGroup(MOCK_AUTH_TOKEN, MOCK_GROUP_ID, users).pipe(
          Effect.provide(mockHttp),
          Effect.exit,
        );

        // The entire operation should fail if any batch fails (fail-fast behavior)
        expect(result).toMatchObject(
          Exit.fail({
            _tag: '@support/MSGraphError',
            message: 'Failed to add members to group',
          }),
        );
      }),
    );
  });

  //
  // ────────────────────────────────
  // removeMembersFromGroup()
  // ────────────────────────────────
  //
  describe('removeMembersFromGroup', () => {
    it.effect('should succeed when removing a single batch of users', ({ expect }) =>
      Effect.gen(function* () {
        const requestCount = yield* Ref.make(0);
        const users = makeMockUsers(10); // 10 users should fit in a single batch (limit is typically 20)

        // MS Graph batch API returns individual responses for each operation
        const mockResponse = { responses: users.map((user) => ({ id: user.id, status: 204 })) };

        const mockHttp = makeMockHttpClient(
          () =>
            Ref.update(requestCount, (n) => n + 1) //
              .pipe(Effect.as(new Response(JSON.stringify(mockResponse), { status: 200 }))), //
        );

        yield* MSGraphClient.removeMembersFromGroup(MOCK_AUTH_TOKEN, MOCK_GROUP_ID, users).pipe(Effect.provide(mockHttp));

        expect(yield* Ref.get(requestCount)).toEqual(1);
      }),
    );

    it.effect('should succeed when removing users that require multiple batch requests', ({ expect }) =>
      Effect.gen(function* () {
        const requestCount = yield* Ref.make(0);
        const users = makeMockUsers(50); // 50 users will require 3 batches (20, 20, 10) assuming batch size of 20

        // Mock response needs to account for all users across all batches
        const mockResponse = { responses: users.map((user) => ({ id: user.id, status: 204 })) };

        const mockHttp = makeMockHttpClient(
          () =>
            Ref.update(requestCount, (n) => n + 1) //
              .pipe(Effect.as(new Response(JSON.stringify(mockResponse), { status: 200 }))), //
        );

        yield* MSGraphClient.removeMembersFromGroup(MOCK_AUTH_TOKEN, MOCK_GROUP_ID, users).pipe(Effect.provide(mockHttp));

        // Should make 3 batch requests for 50 users (assuming batch size of 20)
        expect(yield* Ref.get(requestCount)).toEqual(3);
      }),
    );

    it.effect('should succeed without making any requests when removing an empty array of users', ({ expect }) =>
      Effect.gen(function* () {
        const requestCount = yield* Ref.make(0);

        const mockHttp = makeMockHttpClient(
          () => Ref.update(requestCount, (n) => n + 1).pipe(Effect.as(new Response(null, { status: 200 }))), //
        );

        // Edge case: removing no users should be a no-op
        yield* MSGraphClient.removeMembersFromGroup(MOCK_AUTH_TOKEN, MOCK_GROUP_ID, []).pipe(Effect.provide(mockHttp));

        expect(yield* Ref.get(requestCount)).toEqual(0);
      }),
    );

    it.effect('should fail with an MSGraphError if the top-level batch request fails', ({ expect }) =>
      Effect.gen(function* () {
        const users = makeMockUsers(10);

        // Simulate authentication or authorization failure
        const mockHttp = makeMockHttpClient(
          () => Effect.succeed(new Response('Unauthorized', { status: 401 })), //
        );

        const result = yield* MSGraphClient.removeMembersFromGroup(MOCK_AUTH_TOKEN, MOCK_GROUP_ID, users).pipe(
          Effect.provide(mockHttp),
          Effect.exit,
        );

        expect(result).toMatchObject(
          Exit.fail({
            _tag: '@support/MSGraphError',
            message: 'Failed to remove members from group',
          }),
        );
      }),
    );

    it.effect('should fail with an MSGraphError if a sub-request within the batch response indicates a failure', ({ expect }) =>
      Effect.gen(function* () {
        const users = makeMockUsers(10);

        // Simulate mixed success/failure within a batch response
        // This tests the client's ability to parse individual operation results
        const mockResponse = {
          responses: [
            {
              id: users[0]?.id,
              status: 204, // Success
              body: {},
            },
            {
              id: users[1]?.id,
              status: 404, // Failure - user not found
              body: {
                error: {
                  code: 'Request_ResourceNotFound',
                  message: 'Resource not found',
                },
              },
            },
          ],
        };

        const mockHttp = makeMockHttpClient(
          (req) => Effect.succeed(new Response(JSON.stringify(mockResponse), { status: 200 })), //
        );

        const result = yield* MSGraphClient.removeMembersFromGroup(MOCK_AUTH_TOKEN, MOCK_GROUP_ID, users).pipe(
          Effect.provide(mockHttp),
          Effect.exit,
        );

        // Should fail if any individual operation in the batch fails
        expect(result).toMatchObject(
          Exit.fail({
            _tag: '@support/MSGraphError',
            message: expect.stringMatching('Failed to remove members from group'),
          }),
        );
      }),
    );
  });
});
