export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export const ErrorCodes = {
  UNCAUGHT_ERROR: 'UNC-0000',

  // auth error codes
  MISCONFIGURED_PROVIDER: 'AUTH-0001',
  ACCESS_FORBIDDEN: 'AUTH-0002',
  MISSING_AUTH_HEADER: 'AUTH-0003',
  DISCOVERY_ENDPOINT_MISSING: 'AUTH-0004',
  MISSING_ID_TOKEN: 'AUTH-0005',

  // component error codes
  MISSING_LANG_PARAM: 'CMP-0001',

  // i18n error codes
  NO_LANGUAGE_FOUND: 'I18N-0001',
  MISSING_TRANSLATION_KEY: 'I18N-0002',

  // instance error codes
  NO_FACTORY_PROVIDED: 'INST-0001',

  // route error codes
  ROUTE_NOT_FOUND: 'RTE-0001',

  // dev-only error codes
  TEST_ERROR_CODE: 'DEV-0001',
} as const;
