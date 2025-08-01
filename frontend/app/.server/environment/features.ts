import * as v from 'valibot';

import { stringToBooleanSchema } from '~/.server/validation/string-to-boolean-schema';

export type Features = Readonly<v.InferOutput<typeof features>>;

const isProduction = process.env.NODE_ENV === 'production';

export const defaults = {
  ENABLE_DEVMODE_OIDC: isProduction ? 'false' : 'true',
  ENABLE_LOOKUP_FIELD_SERVICES_MOCK: isProduction ? 'false' : 'true',
  ENABLE_USER_SERVICES_MOCK: isProduction ? 'false' : 'true',
  ENABLE_PROFILE_SERVICES_MOCK: isProduction ? 'false' : 'true',
} as const;

export const features = v.object({
  ENABLE_DEVMODE_OIDC: v.optional(stringToBooleanSchema(), defaults.ENABLE_DEVMODE_OIDC),
  ENABLE_LOOKUP_FIELD_SERVICES_MOCK: v.optional(stringToBooleanSchema(), defaults.ENABLE_LOOKUP_FIELD_SERVICES_MOCK),
  ENABLE_USER_SERVICES_MOCK: v.optional(stringToBooleanSchema(), defaults.ENABLE_USER_SERVICES_MOCK),
  ENABLE_PROFILE_SERVICES_MOCK: v.optional(stringToBooleanSchema(), defaults.ENABLE_PROFILE_SERVICES_MOCK),
});
