import * as v from 'valibot';

export type GcNotify = Readonly<v.InferOutput<typeof notify>>;

//const isProduction = process.env.NODE_ENV === 'production'; 

export const defaults = {
  GC_NOTIFY_API_KEY: '00000000000000000000000000000000000000000000000000000',
  GC_NOTIFY_ENGLISH_TEMPLATE_ID: '00000000-0000-0000-0000-000000000000',
  GC_NOTIFY_FRENCH_TEMPLATE_ID: '00000000-0000-0000-0000-000000000000',
  GC_NOTIFY_API_URL: 'https://api.notification.canada.ca/v2/notifications/email',
  INTEROP_API_BASE_URI: ' ',
} as const;

export const notify = v.object({
  GC_NOTIFY_API_KEY: v.optional(v.string()),
  GC_NOTIFY_ENGLISH_TEMPLATE_ID: v.optional(v.string(), '00000000-0000-0000-0000-000000000000'),
  GC_NOTIFY_FRENCH_TEMPLATE_ID: v.optional(v.string(), '00000000-0000-0000-0000-000000000000'),
  GC_NOTIFY_API_URL: v.optional(v.string(), 'https://api.notification.canada.ca/v2/notifications/email'),

  // Interop API settings
  INTEROP_API_BASE_URI: v.optional(v.string(), 'https://localhost:3000'),
  INTEROP_API_SUBSCRIPTION_KEY: v.optional(v.string(), ' '),

  // http proxy settings
  HTTP_PROXY_URL: v.optional(v.string(), ' '),
});
