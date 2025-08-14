/*
 *
 * This file defines the structure and types for internationalized (i18n) routes.
 * It provides a way to represent routes with different paths for different languages.
 *
 * The `i18nRoutes` constant holds the configuration for these routes, which are then
 * transformed into react-router `RouteConfigEntry` objects in `routes.ts`. This
 * separation allows the i18n route definitions to be imported and used in client-side
 * code when generating links.
 *
 */

/**
 * Represents a record of paths for different languages.
 * Key: Language code (e.g., 'en', 'fr').
 * Value: A path for that language (ex: /en/about or /fr/a-propos).
 */
type I18nPaths = Record<Language, string>;

/**
 * A utility typpe that extracts the file path from an I18nPageRoute type.
 * @template T - The type to extract the file from.
 */
type ExtractI18nRouteFile<T> = T extends I18nPageRoute ? T['file'] : never;

/**
 * A utility typpe that extracts the id from an I18nPageRoute type.
 * @template T - The type to extract the id from.
 */
type ExtractI18nRouteId<T> = T extends I18nPageRoute ? T['id'] : never;

/**
 * A utility type that recursively extracts all file paths from an array of I18nRoute objects.
 * @template T - The type of the I18nRoute array.
 */
type ExtractI18nRouteFiles<T> = T extends I18nLayoutRoute
  ? ExtractI18nRouteFiles<T['children'][number]> //
  : ExtractI18nRouteFile<T>;

/**
 * A utility type that recursively extracts all ids from an array of I18nRoute objects.
 * @template T - The type of the I18nRoute array.
 */
type ExtractI18nRouteIds<T> = T extends I18nLayoutRoute
  ? ExtractI18nRouteIds<T['children'][number]> //
  : ExtractI18nRouteId<T>;

/**
 * Represents a route that can be either a layout route or a page route.
 */
export type I18nRoute = I18nLayoutRoute | I18nPageRoute;

/**
 * Represents a layout route, which contains other routes as children.
 * @property file - The file path for the layout component.
 * @property children - An array of child I18nRoute objects.
 */
export type I18nLayoutRoute = { file: string; children: I18nRoute[] };

/**
 * Represents a page route, which has specific paths for different languages.
 * @property id - A unique identifier for the route.
 * @property file - The file path for the page component.
 * @property paths - An I18nPaths object containing paths for different languages.
 */
export type I18nPageRoute = { id: string; file: string; paths: I18nPaths };

/**
 * Represents all file paths used in the i18n routes.
 */
export type I18nRouteFile = ExtractI18nRouteFiles<(typeof i18nRoutes)[number]>;

/**
 * Represents all ids used in the i18n routes.
 */
export type I18nRouteId = ExtractI18nRouteIds<(typeof i18nRoutes)[number]>;

/**
 * Type guard to determine if a route is an I18nLayoutRoute.
 * @param obj - The object to check.
 * @returns `true` if the object is an I18nLayoutRoute, `false` otherwise.
 */
export function isI18nLayoutRoute(obj: unknown): obj is I18nLayoutRoute {
  return obj !== null && typeof obj === 'object' && 'file' in obj && 'children' in obj;
}

/**
 * Type guard to determine if a route is an I18nPageRoute.
 * @param obj - The object to check.
 * @returns `true` if the object is an I18nPageRoute, `false` otherwise.
 */
export function isI18nPageRoute(obj: unknown): obj is I18nPageRoute {
  return obj !== null && typeof obj === 'object' && 'file' in obj && 'paths' in obj;
}

/**
 * Bilingual routes are declared in an I18nRoute[] object so the
 * filenames can be extracted and strongly typed as I18nPageRouteId
 *
 * These routes exist in a separate module from routes.ts so they can
 * be imported into clientside code without triggering side effects.
 */
export const i18nRoutes = [
  {
    file: 'routes/layout.tsx',
    children: [
      {
        id: 'PROT-0001',
        file: 'routes/index.tsx',
        paths: { en: '/en/', fr: '/fr/' },
      },
      {
        id: 'EMPL-0001',
        file: 'routes/employee/index.tsx',
        paths: {
          en: '/en/employee',
          fr: '/fr/employe',
        },
      },
      {
        id: 'EMPL-0002',
        file: 'routes/employee/profile/privacy-consent.tsx',
        paths: {
          en: '/en/employee/profile/privacy-consent',
          fr: '/fr/employe/profil/consentement-a-la-confidentialite',
        },
      },
      {
        id: 'EMPL-0003',
        file: 'routes/employee/profile/index.tsx',
        paths: {
          en: '/en/employee/profile',
          fr: '/fr/employe/profil',
        },
      },
      {
        id: 'EMPL-0004',
        file: 'routes/employee/profile/personal-information.tsx',
        paths: {
          en: '/en/employee/profile/personal-information',
          fr: '/fr/employe/profil/informations-personnelles',
        },
      },
      {
        id: 'EMPL-0005',
        file: 'routes/employee/profile/employment-information.tsx',
        paths: {
          en: '/en/employee/profile/employment-information',
          fr: `/fr/employe/profil/informations-sur-lemploi`,
        },
      },
      {
        id: 'EMPL-0006',
        file: 'routes/employee/profile/referral-preferences.tsx',
        paths: {
          en: '/en/employee/profile/referral-preferences',
          fr: '/fr/employe/profil/préférences-de-référence',
        },
      },
      {
        id: 'HRAD-0001',
        file: 'routes/hr-advisor/index.tsx',
        paths: {
          en: '/en/hr-advisor',
          fr: '/fr/hr-advisor',
        },
      },
      {
        id: 'HRAD-0002',
        file: 'routes/hr-advisor/employees.tsx',
        paths: {
          en: '/en/hr-advisor/employees',
          fr: '/fr/hr-advisor/employes',
        },
      },
      {
        id: 'HRAD-0003',
        file: 'routes/hr-advisor/employee-profile/index.tsx',
        paths: {
          en: '/en/hr-advisor/employee-profile/:profileId',
          fr: '/fr/hr-advisor/employe-profil/:profileId',
        },
      },
      {
        id: 'HRAD-0004',
        file: 'routes/hr-advisor/employee-profile/personal-information.tsx',
        paths: {
          en: '/en/hr-advisor/employee-profile/personal-information/:profileId',
          fr: '/fr/hr-advisor/employe-profil/informations-personnelles/:profileId',
        },
      },
      {
        id: 'HRAD-0005',
        file: 'routes/hr-advisor/employee-profile/employment-information.tsx',
        paths: {
          en: '/en/hr-advisor/employee-profile/employment-information/:profileId',
          fr: `/fr/hr-advisor/employe-profil/informations-sur-lemploi/:profileId`,
        },
      },
      {
        id: 'HRAD-0006',
        file: 'routes/hr-advisor/employee-profile/referral-preferences.tsx',
        paths: {
          en: '/en/hr-advisor/employee-profile/referral-preferences/:profileId',
          fr: '/fr/hr-advisor/employe-profil/préférences-de-référence/:profileId',
        },
      },
      {
        id: 'HIRE-0001',
        file: 'routes/hiring-manager/index.tsx',
        paths: {
          en: '/en/hiring-manager',
          fr: '/fr/gestionnaire-embauche',
        },
      },
      {
        id: 'HIRE-0002',
        file: 'routes/hiring-manager/requests.tsx',
        paths: {
          en: '/en/hiring-manager/requests',
          fr: '/fr/gestionnaire-embauche/demandes',
        },
      },
      {
        id: 'HIRE-0003',
        file: 'routes/hiring-manager/request/index.tsx',
        paths: {
          en: '/en/hiring-manager/request/:requestId',
          fr: '/fr/gestionnaire-embauche/demande/:requestId',
        },
      },
      {
        id: 'HIRE-0004',
        file: 'routes/hiring-manager/request/process-information.tsx',
        paths: {
          en: '/en/hiring-manager/request/:requestId/process-information',
          fr: '/fr/gestionnaire-embauche/demande/:requestId/informations-processus',
        },
      },
      {
        id: 'HIRE-0005',
        file: 'routes/hiring-manager/request/position-information.tsx',
        paths: {
          en: '/en/hiring-manager/request/:requestId/position-information',
          fr: '/fr/gestionnaire-embauche/demande/:requestId/informations-poste',
        },
      },
      {
        id: 'HIRE-0006',
        file: 'routes/hiring-manager/request/somc-conditions.tsx',
        paths: {
          en: '/en/hiring-manager/request/:requestId/somc-conditions',
          fr: '/fr/gestionnaire-embauche/demande/:requestId/cmc-conditions',
        },
      },
      {
        id: 'HIRE-0007',
        file: 'routes/hiring-manager/request/submission-details.tsx',
        paths: {
          en: '/en/hiring-manager/request/:requestId/submission-details',
          fr: '/fr/gestionnaire-embauche/demande/:requestId/details-soumission',
        },
      },
      {
        id: 'HIRE-0008',
        file: 'routes/hiring-manager/request/matches.tsx',
        paths: {
          en: '/en/hiring-manager/request/:requestId/matches',
          fr: '/fr/gestionnaire-embauche/demande/:requestId/correspondances',
        },
      },
      {
        id: 'HIRE-0009',
        file: 'routes/hiring-manager/request/profile.tsx',
        paths: {
          en: '/en/hiring-manager/request/:requestId/profile/:profileId',
          fr: '/fr/gestionnaire-embauche/demande/:requestId/profil/:profileId',
        },
      },
      {
        id: 'HIRE-0010',
        file: 'routes/hiring-manager/request/match.tsx',
        paths: {
          en: '/en/hiring-manager/request/:requestId/match/:profileId',
          fr: '/fr/gestionnaire-embauche/demande/:requestId/correspondance/:profileId',
        },
      },
    ],
  },
] as const satisfies I18nRoute[];
