import { NodeHttpClient, NodeRuntime } from "@effect/platform-node";
import { Config, Effect, Logger, LogLevel } from "effect";

import * as MSGraphClient from "~/msgraph/msgraph-client";

const AppConfig = Config.all({
  dryRun: Config.withDefault(Config.boolean("DRY_RUN"), true),
  //
  sourceGroupIds: Config.array(Config.string("SOURCE_GROUP_IDS")),
  targetGroupId: Config.string("TARGET_GROUP_ID"),
  //
  tenantId: Config.string("TENANT_ID"),
  clientId: Config.string("CLIENT_ID"),
  clientSecret: Config.string("CLIENT_SECRET"),
});

const executeDryRun = (usersToAdd: MSGraphClient.MSGraphUser[], usersToRemove: MSGraphClient.MSGraphUser[]) =>
  Effect.gen(function* () {
    yield* Effect.logWarning("DRY RUN ENABLED -- No changes will be made.");

    if (usersToAdd.length > 0) {
      yield* Effect.logWarning(
        "DRY RUN: Would add the following users:",
        usersToAdd.map((user) => user.displayName)
      );
    }

    if (usersToRemove.length > 0) {
      yield* Effect.logWarning(
        "DRY RUN: Would remove the following users:",
        usersToRemove.map((user) => user.displayName)
      );
    }
  });

const executeSync = (
  authToken: string,
  targetGroupId: string,
  usersToAdd: MSGraphClient.MSGraphUser[],
  usersToRemove: MSGraphClient.MSGraphUser[]
) =>
  Effect.gen(function* () {
    yield* Effect.logInfo("‼‼ Executing changes ‼‼");
    yield* Effect.all([
      usersToAdd.length > 0 ? MSGraphClient.addMembersToGroup(authToken, targetGroupId, usersToAdd) : Effect.void,
      usersToRemove.length > 0 ? MSGraphClient.removeMembersFromGroup(authToken, targetGroupId, usersToRemove) : Effect.void,
    ]);
  });

const program = Effect.gen(function* () {
  const appConfig = yield* AppConfig;

  const authToken = yield* MSGraphClient.authenticate(
    appConfig.tenantId,
    appConfig.clientId,
    appConfig.clientSecret,
    "https://graph.microsoft.com/.default"
  );

  const [targetUsers, sourceUsers] = yield* Effect.all([
    MSGraphClient.getDirectGroupMembers(authToken, appConfig.targetGroupId),
    Effect.forEach(appConfig.sourceGroupIds, (groupId) => MSGraphClient.getTransitiveGroupMembers(authToken, groupId)).pipe(
      Effect.map((users) => users.flat()),
      Effect.map((users) => Array.from(new Map(users.map((user) => [user.id, user])).values()))
    ),
  ]);

  yield* Effect.logInfo(`Found ${targetUsers.length} members in target group ${appConfig.targetGroupId}`);
  yield* Effect.logInfo(`Found ${sourceUsers.length} members in source groups ${appConfig.sourceGroupIds}`);

  const sourceUserIds = new Set(sourceUsers.map((user) => user.id));
  const targetUserIds = new Set(targetUsers.map((user) => user.id));
  const usersToAdd = sourceUsers.filter((user) => !targetUserIds.has(user.id));
  const usersToRemove = targetUsers.filter((user) => !sourceUserIds.has(user.id));

  yield* Effect.logInfo(`Will remove ${usersToRemove.length} users and add ${usersToAdd.length} users`).pipe(
    Effect.annotateLogs({ groupId: appConfig.targetGroupId })
  );

  yield* appConfig.dryRun
    ? executeDryRun(usersToAdd, usersToRemove)
    : executeSync(authToken, appConfig.targetGroupId, usersToAdd, usersToRemove);

  yield* Effect.logInfo("Group synchronization complete:", {
    dryRun: appConfig.dryRun,
    sourceGroups: appConfig.sourceGroupIds,
    targetGroup: appConfig.targetGroupId,
    sourceGroupMemberCount: sourceUsers.length,
    targetGroupMemberCount: targetUsers.length,
    usersAdded: {
      count: usersToAdd.length,
      users: usersToAdd.map((user) => user.displayName),
    },
    usersRemoved: {
      count: usersToRemove.length,
      users: usersToRemove.map((user) => user.displayName),
    },
  });
});

NodeRuntime.runMain(
  program.pipe(
    Effect.withConcurrency(5),
    Effect.withLogSpan("main"),
    Logger.withMinimumLogLevel(LogLevel.Info),
    Effect.provide(Logger.pretty),
    Effect.provide(NodeHttpClient.layer)
  )
);
