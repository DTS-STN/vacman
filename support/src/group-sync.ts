import { NodeHttpClient, NodeRuntime } from '@effect/platform-node';
import { Config, Effect, Logger, LogLevel } from 'effect';

import * as MSGraphClient from '~/msgraph/msgraph-client';

//
// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
//
/**
 * Microsoft Graph API scope for application-level access
 */
const MS_GRAPH_SCOPE = 'https://graph.microsoft.com/.default';

/**
 * Concurrency limit for HTTP requests to avoid overwhelming the API
 */
const HTTP_CONCURRENCY_LIMIT = 5;

//
// ─────────────────────────────────────────────────────────────
// Configuration Schema
// ─────────────────────────────────────────────────────────────
//

/**
 * Application configuration schema using Effect Config.
 *
 * This defines all required environment variables and their types:
 *   - DRY_RUN: Whether to simulate changes without executing them (defaults to true for safety)
 *   - SOURCE_GROUP_IDS: Comma-separated list of source group IDs to sync from
 *   - TARGET_GROUP_ID: Single target group ID to sync to
 *   - TENANT_ID, CLIENT_ID, CLIENT_SECRET: Azure AD app registration credentials
 */
const AppConfig = Config.all({
  dryRun: Config.withDefault(Config.boolean('DRY_RUN'), true),
  logLevel: Config.withDefault(Config.string('LOG_LEVEL'), 'info'),

  sourceGroupIds: Config.array(Config.string('SOURCE_GROUP_IDS')),
  targetGroupId: Config.string('TARGET_GROUP_ID'),

  tenantId: Config.string('TENANT_ID'),
  clientId: Config.string('CLIENT_ID'),
  clientSecret: Config.string('CLIENT_SECRET'),
});

// ─────────────────────────────────────────────────────────────
// Execution Strategies
// ─────────────────────────────────────────────────────────────

/**
 * Handles dry-run mode by logging what changes would be made.
 *
 * In dry-run mode, we simulate the synchronization process without making
 * any actual changes to group memberships. This is useful for:
 *   - Testing configuration
 *   - Previewing changes before execution
 *   - Auditing what the sync would do
 */
const executeDryRun = (
  usersToAdd: MSGraphClient.MSGraphUser[], //
  usersToRemove: MSGraphClient.MSGraphUser[],
) =>
  Effect.gen(function* () {
    yield* Effect.logWarning('DRY RUN ENABLED -- No changes will be made.');

    if (usersToAdd.length > 0) {
      yield* Effect.logWarning(
        `DRY RUN: Would add ${usersToAdd.length} users:`,
        usersToAdd.map((user) => user.displayName),
      );
    }

    if (usersToRemove.length > 0) {
      yield* Effect.logWarning(
        `DRY RUN: Would remove ${usersToRemove.length} users:`,
        usersToRemove.map((user) => user.displayName),
      );
    }

    // Log summary for easy overview
    yield* Effect.logInfo('DRY RUN SUMMARY:', {
      totalChanges: usersToAdd.length + usersToRemove.length,
      additions: usersToAdd.length,
      removals: usersToRemove.length,
    });
  });

/**
 * Executes the actual synchronization by adding and removing users from the target group.
 *
 * This function performs the real MS Graph API calls to modify group membership.
 * Operations are performed concurrently for efficiency, but the function will
 * fail fast if either operation encounters an error.
 */
const executeSync = (
  authToken: string,
  targetGroupId: string,
  usersToAdd: MSGraphClient.MSGraphUser[],
  usersToRemove: MSGraphClient.MSGraphUser[],
) =>
  Effect.gen(function* () {
    yield* Effect.logInfo('‼️ EXECUTING CHANGES ‼️');

    // Perform add and remove operations concurrently for efficiency..
    // Using Effect.all ensures both operations complete successfully or the entire sync fails
    yield* Effect.all([
      usersToAdd.length > 0 ? MSGraphClient.addMembersToGroup(authToken, targetGroupId, usersToAdd) : Effect.void,
      usersToRemove.length > 0 ? MSGraphClient.removeMembersFromGroup(authToken, targetGroupId, usersToRemove) : Effect.void,
    ]);

    yield* Effect.logInfo('All membership changes applied successfully');
  });

//
// ─────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────
//

/**
 * Converts a string log level to Effect's LogLevel enum.
 * Supports common log level names (case-insensitive) and provides a fallback to Info.
 */
const parseLogLevel = (level: string): LogLevel.LogLevel => {
  switch (level.toLowerCase().trim()) {
    case 'trace': {
      return LogLevel.Trace;
    }

    case 'debug': {
      return LogLevel.Debug;
    }

    case 'info': {
      return LogLevel.Info;
    }

    case 'warn': {
      return LogLevel.Warning;
    }

    case 'error': {
      return LogLevel.Error;
    }

    case 'fatal': {
      return LogLevel.Fatal;
    }

    default: {
      console.warn(`Invalid LOG_LEVEL ${level}; defaulting to INFO`);
      return LogLevel.Info;
    }
  }
};

//
// ─────────────────────────────────────────────────────────────
// User Collection & Deduplication Utilities
// ─────────────────────────────────────────────────────────────
//

/**
 * Deduplicates an array of MSGraphUser objects by user ID.
 *
 * @param users The array of users to deduplicate.
 * @returns A new array with duplicate users removed.
 */
const dedupeUsers = (users: MSGraphClient.MSGraphUser[]) => {
  const userMap = new Map(users.map((user) => [user.id, user]));
  return Array.from(userMap.values());
};

/**
 * Collects all users from source groups and deduplicates them by user ID.
 *
 * This function:
 *   1. Fetches transitive members from each source group (includes nested groups)
 *   2. Flattens all user arrays into a single collection
 *   3. Deduplicates by user ID (a user may belong to multiple source groups)
 *
 * We use transitive membership to capture users in nested groups, which is
 * often desired in organizational hierarchies.
 */
const collectAndDedupeSourceUsers = (authToken: string, sourceGroupIds: string[]) =>
  Effect.forEach(sourceGroupIds, (groupId) => MSGraphClient.getTransitiveGroupMembers(authToken, groupId)).pipe(
    Effect.map((userArrays) => userArrays.flat()),
    Effect.map(dedupeUsers),
  );

/**
 * Determines which users need to be added to and removed from the target group.
 *
 * The synchronization logic:
 *   - Users in source groups but not in target → ADD
 *   - Users in target group but not in any source group → REMOVE
 *   - Users in both → NO CHANGE (already synchronized)
 */
const calculateMembershipChanges = (sourceUsers: MSGraphClient.MSGraphUser[], targetUsers: MSGraphClient.MSGraphUser[]) => {
  const sourceUserIds = new Set(sourceUsers.map((user) => user.id));
  const targetUserIds = new Set(targetUsers.map((user) => user.id));

  // Find users that need to be added (in source but not in target)
  const usersToAdd = sourceUsers.filter((user) => !targetUserIds.has(user.id));

  // Find users that need to be removed (in target but not in source)
  const usersToRemove = targetUsers.filter((user) => !sourceUserIds.has(user.id));

  return { usersToAdd, usersToRemove };
};

//
// ─────────────────────────────────────────────────────────────
// Main Program
// ─────────────────────────────────────────────────────────────
//

/**
 * Fetches and categorizes members from a target group and multiple source groups.
 */
const getGroupMembers = (authToken: string, targetGroupId: string, sourceGroupIds: string[]) =>
  Effect.gen(function* () {
    const [targetUsers, sourceUsers] = yield* Effect.all([
      MSGraphClient.getDirectGroupMembers(authToken, targetGroupId),
      collectAndDedupeSourceUsers(authToken, sourceGroupIds),
    ]);

    return { targetUsers, sourceUsers };
  });

/**
 * Main synchronization program that orchestrates the entire process.
 *
 * Process flow:
 *   1. Load configuration from environment variables
 *   2. Authenticate with Microsoft Graph API
 *   3. Fetch current target group members (direct only, since we manage them)
 *   4. Fetch all source group members (transitive, to include nested groups)
 *   5. Calculate the diff (users to add/remove)
 *   6. Execute changes or simulate them based on dry-run flag
 *   7. Log comprehensive summary
 */
const program = Effect.gen(function* () {
  const appConfig = yield* AppConfig;

  yield* Effect.logInfo('Starting group synchronization', {
    dryRun: appConfig.dryRun,
    sourceGroups: appConfig.sourceGroupIds,
    targetGroup: appConfig.targetGroupId,
  });

  yield* Effect.logInfo('Authenticating with Microsoft Graph API...');

  const authToken = yield* MSGraphClient.authenticate(
    appConfig.tenantId,
    appConfig.clientId,
    appConfig.clientSecret,
    MS_GRAPH_SCOPE,
  );

  yield* Effect.logInfo('Fetching group memberships...');

  const { targetUsers, sourceUsers } = yield* getGroupMembers(authToken, appConfig.targetGroupId, appConfig.sourceGroupIds);

  yield* Effect.logInfo('Current state:', {
    targetGroupMembers: targetUsers.length,
    sourceGroupMembers: sourceUsers.length,
    sourceGroups: appConfig.sourceGroupIds.length,
  }).pipe(Effect.annotateLogs({ sourceGroupIds: appConfig.sourceGroupIds, targetGroupId: appConfig.targetGroupId }));

  const { usersToAdd, usersToRemove } = calculateMembershipChanges(sourceUsers, targetUsers);

  yield* Effect.logInfo('Synchronization plan:', {
    usersToAdd: usersToAdd.length,
    usersToRemove: usersToRemove.length,
    totalChanges: usersToAdd.length + usersToRemove.length,
  }).pipe(Effect.annotateLogs({ sourceGroupIds: appConfig.sourceGroupIds, targetGroupId: appConfig.targetGroupId }));

  //
  // Early exit if no changes are needed
  //
  if (usersToAdd.length === 0 && usersToRemove.length === 0) {
    return yield* Effect.logInfo('No changes needed -- groups are already synchronized');
  }

  yield* appConfig.dryRun
    ? executeDryRun(usersToAdd, usersToRemove)
    : executeSync(authToken, appConfig.targetGroupId, usersToAdd, usersToRemove);

  yield* Effect.logInfo('Group synchronization complete', {
    operation: appConfig.dryRun ? 'DRY_RUN' : 'SYNC',
    sourceGroups: appConfig.sourceGroupIds,
    targetGroup: appConfig.targetGroupId,
    statistics: {
      sourceGroupMemberCount: sourceUsers.length,
      targetGroupMemberCount: targetUsers.length,
      usersAdded: usersToAdd.length,
      usersRemoved: usersToRemove.length,
    },

    // Include user details for audit trail (consider removing in production for large groups)
    details: {
      addedUsers: usersToAdd.map((user) => ({ id: user.id, displayName: user.displayName })),
      removedUsers: usersToRemove.map((user) => ({ id: user.id, displayName: user.displayName })),
    },
  });
});

//
// ─────────────────────────────────────────────────────────────
// Application Entry Point
// ─────────────────────────────────────────────────────────────
//

/**
 * Application entry point with comprehensive runtime configuration.
 *
 * The Effect runtime is configured with:
 *   - Concurrency limit to avoid overwhelming MS Graph API
 *   - Log span for tracing the entire operation
 *   - Minimum log level (Info) to reduce noise
 *   - Pretty logging for better console output
 *   - HTTP client layer for making API requests
 */
const main = Effect.gen(function* () {
  const { logLevel } = yield* AppConfig;

  return yield* program.pipe(
    Logger.withMinimumLogLevel(parseLogLevel(logLevel)),
    Effect.withConcurrency(HTTP_CONCURRENCY_LIMIT), // Limit concurrent HTTP requests
    Effect.withLogSpan('group-sync-main'), // Add tracing span for the entire operation
    Effect.provide(Logger.pretty),
    Effect.provide(NodeHttpClient.layer),
  );
});

// Let 'er rip! 🎉
NodeRuntime.runMain(main);
