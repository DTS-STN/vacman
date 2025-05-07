import * as v from 'valibot';

import { stringToBooleanSchema } from '~/.server/validation/string-to-boolean-schema';
import { isValidTimeZone } from '~/utils/date-utils';

export type Client = Readonly<v.InferOutput<typeof client>>;

export const defaults = {
  BASE_TIMEZONE: 'Canada/Eastern',
  BUILD_DATE: '1970-01-01T00:00:00.000Z',
  BUILD_ID: '000000',
  BUILD_REVISION: '00000000',
  BUILD_VERSION: '0.0.0-000000-00000000',
  I18NEXT_DEBUG: 'false',
} as const;

/**
 * Environment variables that are safe to expose publicly to the client.
 * ⚠️ IMPORTANT: DO NOT PUT SENSITIVE CONFIGURATIONS HERE ⚠️
 */
export const client = v.object({
  BASE_TIMEZONE: v.optional(v.pipe(v.string(), v.check(isValidTimeZone)), defaults.BASE_TIMEZONE),
  BUILD_DATE: v.optional(v.string(), defaults.BUILD_DATE),
  BUILD_ID: v.optional(v.string(), defaults.BUILD_ID),
  BUILD_REVISION: v.optional(v.string(), defaults.BUILD_REVISION),
  BUILD_VERSION: v.optional(v.string(), defaults.BUILD_VERSION),
  I18NEXT_DEBUG: v.optional(stringToBooleanSchema(), defaults.I18NEXT_DEBUG),
  isProduction: v.boolean(),
});
