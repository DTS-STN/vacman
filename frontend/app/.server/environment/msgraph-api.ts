import * as v from 'valibot';

import { stringToBooleanSchema } from '~/.server/validation/string-to-boolean-schema';

export type MsgraphApi = Readonly<v.InferOutput<typeof msgraphApi>>;

const isProduction = process.env.NODE_ENV === 'production';

export const defaults = {
  MSGRAPH_BASE_URL: 'https://graph.microsoft.com/v1.0',
  ENABLE_MSGRAPH_SERVICES_MOCK: isProduction ? 'false' : 'true',
} as const;

export const msgraphApi = v.object({
  MSGRAPH_BASE_URL: v.optional(v.string(), defaults.MSGRAPH_BASE_URL),
  ENABLE_MSGRAPH_SERVICES_MOCK: v.optional(stringToBooleanSchema(), defaults.ENABLE_MSGRAPH_SERVICES_MOCK),
});
