import * as v from 'valibot';

import { Redacted } from '~/.server/utils/security-utils';

export type Authentication = Readonly<v.InferOutput<typeof authentication>>;

const isProduction = process.env.NODE_ENV === 'production';

export const defaults = {
  AUTH_DEFAULT_PROVIDER: isProduction ? 'azuread' : 'local',
  AUTH_SCOPES: 'openid profile email User.Read',
} as const;

export const authentication = v.object({
  AUTH_DEFAULT_PROVIDER: v.optional(v.picklist(['azuread', 'local']), defaults.AUTH_DEFAULT_PROVIDER),
  AUTH_SCOPES: v.optional(v.string(), defaults.AUTH_SCOPES),

  AZUREAD_ISSUER_URL: v.optional(v.string()),
  AZUREAD_CLIENT_ID: v.optional(v.string()),
  AZUREAD_CLIENT_SECRET: v.optional(v.pipe(v.string(), v.transform(Redacted.make))),
  AZUREAD_TENANT_ID: v.optional(v.string()),
});
