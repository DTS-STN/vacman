import { SqlClient } from '@effect/sql';
import { MssqlClient } from '@effect/sql-mssql';
import { Config, Effect } from 'effect';

import type { MsGraphUser } from '~/msgraph/schemas';
import { MsSqlError } from '~/mssql/errors';

const MsSqlConfigLive = Config.all({
  defaultLanguageId: Config.withDefault(Config.number('MSSQL_DEFAULT_LANGUAGE_ID'), 0),
  employeeGroupId: Config.withDefault(Config.number('MSSQL_EMPLOYEE_GROUP_ID'), 0),
  hrAdvisorGroupId: Config.withDefault(Config.number('MSSQL_HR_ADVISOR_GROUP_ID'), 3),
});

const MssqlClientLive = MssqlClient.layerConfig({
  encrypt: Config.withDefault(Config.boolean('MSSQL_ENCRYPT'), true),
  server: Config.string('MSSQL_SERVER'),
  database: Config.string('MSSQL_DATABASE'),
  port: Config.withDefault(Config.integer('MSSQL_PORT'), 1433),
  username: Config.string('MSSQL_USER'),
  password: Config.redacted('MSSQL_PASSWORD'),
});

export class MsSqlService extends Effect.Service<MsSqlService>()('@support/MsSqlClient', {
  dependencies: [MssqlClientLive],
  effect: Effect.gen(function* () {
    const config = yield* MsSqlConfigLive;
    const sqlClient = yield* SqlClient.SqlClient;

    return {
      update: (hrAdvisors: MsGraphUser[]) =>
        Effect.gen(function* () {
          const hrAdvisorIds = hrAdvisors.map((user) => user.id);

          yield* Effect.logInfo('Updating users; setting all non-HR advisors to employee group');

          const updatedEmployees = yield* sqlClient`
            UPDATE [user]
            SET [user_type_id] = ${config.employeeGroupId}
            OUTPUT inserted.ms_entra_id
            WHERE NOT ${sqlClient.in('ms_entra_id', hrAdvisorIds)}
            AND [user_type_id] <> ${config.employeeGroupId}
          `;

          yield* Effect.logInfo(`Updated ${updatedEmployees.length} employees`);

          yield* Effect.logInfo('Updating users; setting all HR advisors to HR advisor group');

          const updatedHrAdvisors = yield* sqlClient`
            UPDATE [user]
            SET [user_type_id] = ${config.hrAdvisorGroupId}
            OUTPUT inserted.ms_entra_id
            WHERE ${sqlClient.in('ms_entra_id', hrAdvisorIds)}
            AND [user_type_id] <> ${config.hrAdvisorGroupId}
          `;

          yield* Effect.logInfo(`Updated ${updatedHrAdvisors.length} HR advisors`);

          yield* Effect.logInfo('Creating missing HR advisors');

          const insertedHrAdvisors: string[] = [];

          for (const hrAdvisor of hrAdvisors) {
            const result = yield* sqlClient`
              IF NOT EXISTS (SELECT 1 FROM [user] WHERE [ms_entra_id] = ${hrAdvisor.id})
              BEGIN
                INSERT INTO [user] (
                  [user_type_id],
                  [language_id],
                  [ms_entra_id],
                  [first_name],
                  [last_name],
                  [business_email_address],
                  [user_created]
                )
                OUTPUT inserted.ms_entra_id
                VALUES (
                  ${config.hrAdvisorGroupId},
                  ${config.defaultLanguageId},
                  ${hrAdvisor.id},
                  ${hrAdvisor.givenName},
                  ${hrAdvisor.surname},
                  ${hrAdvisor.mail},
                  'group-sync' -- user_created
                )
              END
            `;

            if (result.length > 0) {
              insertedHrAdvisors.push((result[0] as { ms_entra_id: string }).ms_entra_id);
            }
          }

          yield* Effect.logInfo('Updating users complete');

          return {
            hrAdvisorsCreated: insertedHrAdvisors,
            updatedEmployees: updatedEmployees.map((row: unknown) => (row as { ms_entra_id: string }).ms_entra_id),
            updatedHrAdvisors: updatedHrAdvisors.map((row: unknown) => (row as { ms_entra_id: string }).ms_entra_id),
          };
        }).pipe(
          Effect.withLogSpan('MsSqlService.update'),
          Effect.mapError(
            (error) => new MsSqlError({ message: 'Failed to update users', error: error }), //
          ),
        ),
    };
  }),
}) {}
