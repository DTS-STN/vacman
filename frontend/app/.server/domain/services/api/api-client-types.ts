import { Schema } from 'effect';

/**
 * Creates a schema for a response object that wraps an array of items in a 'content' property.
 * This is a common pattern for paginated or collection-based API endpoints.
 */
export const ContentResponseSchema = <A, I>(schema: Schema.Schema<A, I>) =>
  Schema.Struct({
    content: Schema.Array(schema),
  });

/**
 * A schema representing a generic code (ie: lookup) value.
 */
export const CodeSchema = Schema.Struct({
  id: Schema.Number,
  code: Schema.String,
  nameEn: Schema.String,
  nameFr: Schema.String,
  // TODO ::: GjB ::: add other fields
});

export const CitySchema = CodeSchema;
export type City = Schema.Schema.Type<typeof CitySchema>;
