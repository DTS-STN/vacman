import * as v from 'valibot';

import { Redacted } from '~/.server/utils/security-utils';

export type GcNotify = Readonly<v.InferOutput<typeof notify>>;

export const defaults = {
  GC_NOTIFY_API_KEY: '00000000000000000000000000000000000000000000000000000',
  GC_NOTIFY_ENGLISH_TEMPLATE_ID: '00000000-0000-0000-0000-000000000000',
  GC_NOTIFY_FRENCH_TEMPLATE_ID: '00000000-0000-0000-0000-000000000000',
  GC_NOTIFY_API_URL: 'https://api.notification.canada.ca/v2/notifications/email',
  INTEROP_API_BASE_URI: ' ',
} as const;

export const notify = v.object({
  GC_NOTIFY_API_KEY: v.optional(v.pipe(v.string(), v.transform(Redacted.make))),
  GC_NOTIFY_ENGLISH_TEMPLATE_ID: v.optional(v.string(), '00000000-0000-0000-0000-000000000000'),
  GC_NOTIFY_FRENCH_TEMPLATE_ID: v.optional(v.string(), '00000000-0000-0000-0000-000000000000'),
  GC_NOTIFY_API_URL: v.optional(v.string(), 'https://api.notification.canada.ca/v2/notifications/email'),

  // Interop API settings
  INTEROP_API_BASE_URI: v.optional(v.string(), 'https://api.notification.canada.ca/v2/notifications/email'),
  INTEROP_API_SUBSCRIPTION_KEY: v.optional(v.pipe(v.string(), v.transform(Redacted.make))),
});
