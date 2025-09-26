import { Schema } from 'effect';

/**
 * Schema for the standard error response from the Microsoft Graph API. Captures
 * the structured error object containing a code and message, as documented by
 * Microsoft Graph.
 */
export const MSGraphErrorResponse = Schema.Struct({
  error: Schema.Struct({
    code: Schema.String,
    message: Schema.String,
  }),
});

/**
 * Schema for the OAuth2 access token response from Microsoft Entra ID.
 * Parses the successful response from the `/oauth2/v2.0/token` endpoint.
 */
export const AccessTokenResponse = Schema.Struct({
  access_token: Schema.String,
});

export const BatchSuccessResponse = Schema.Struct({
  id: Schema.String,
  status: Schema.Int.pipe(Schema.filter((status) => status >= 200 && status < 300)),
});

export const BatchErrorResponse = Schema.Struct({
  id: Schema.String,
  status: Schema.Int,
  body: MSGraphErrorResponse,
});

export const BatchResponse = Schema.Struct({
  responses: Schema.Array(Schema.Union(BatchSuccessResponse, BatchErrorResponse)),
});

/**
 * Schema for a Microsoft Graph User object. Defines the structure for a user,
 * including essential fields like `id`, `displayName`, and the `@odata.type`
 * discriminator.
 */
export const MSGraphUser = Schema.Struct({
  '@odata.type': Schema.String,
  'id': Schema.String,
  'displayName': Schema.String,
});

/**
 * A generic schema for parsing MSGraph responses that contain paginated data.
 *
 * @param schema The `Schema.Schema` to apply to each element in the `value` array.
 * @returns A `Schema.Struct` that can parse the standard collection response.
 */
export const PagedResponse = <A, I, R>(schema: Schema.Schema<A, I, R>) =>
  Schema.Struct({
    '@odata.nextLink': Schema.optional(Schema.String),
    'value': Schema.Array(schema),
  });

//
// Exported types
//

export type MSGraphUser = Schema.Schema.Type<typeof MSGraphUser>;
