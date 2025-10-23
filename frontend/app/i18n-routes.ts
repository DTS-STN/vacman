/*
 * I18n Routes Configuration
 *
 * This file defines the structure and types for internationalized (i18n) routes.
 * It provides a way to represent routes with different paths for different languages
 * (currently English and French).
 *
 * The `i18nRoutes` constant holds the configuration for these routes, which are then
 * transformed into react-router `RouteConfigEntry` objects in `routes.ts`. This
 * separation allows the i18n route definitions to be imported and used in client-side
 * code when generating links.
 *
 * ## Architecture
 *
 * The route structure uses a hierarchical model:
 * - **Layout Routes**: Define shared UI structure (headers, footers, navigation)
 *   and contain child routes. They have a `file` and `children` property.
 * - **Page Routes**: Define actual pages with URLs. They have an `id`, `file`,
 *   and `paths` property containing URLs for each language.
 *
 * ## Performance
 *
 * Route lookups are optimized using indexes built at application startup.
 * See `buildRouteIndexes()` in `app/utils/route-utils.ts`.
 *
 * ## Type Safety
 *
 * The configuration uses `as const satisfies I18nRoute[]` to ensure:
 * - TypeScript can infer exact string literal types for IDs and files
 * - All routes conform to the I18nRoute interface
 * - Generated types (I18nRouteFile, I18nRouteId) are accurate
 *
 * ## Usage Examples
 *
 * ### Adding a New Route
 *
 * ```typescript
 * {
 *   id: 'EMPL-0007',  // Unique ID following [PREFIX]-[NUMBER] format
 *   file: 'routes/employee/new-page.tsx',  // Component file path
 *   paths: {
 *     en: '/en/employee/new-page',
 *     fr: '/fr/employe/nouvelle-page'  // Translated path
 *   }
 * }
 * ```
 *
 * ### Using in Components
 *
 * ```typescript
 * import { AppLink } from '~/components/links';
 *
 * // Type-safe link to a route
 * <AppLink file="routes/employee/index.tsx" lang="en">
 *   Go to Employee Dashboard
 * </AppLink>
 * ```
 *
 * ### Server-Side Redirects
 *
 * ```typescript
 * import { i18nRedirect } from '~/.server/utils/route-utils';
 *
 * // Redirect to a route in the appropriate language
 * return i18nRedirect('routes/employee/index.tsx', request);
 * ```
 *
 * ## Validation
 *
 * Run `pnpm route:validate` to check for:
 * - Duplicate route IDs
 * - Missing file paths
 * - Path conflicts
 * - Missing language paths
 *
 */

/**
 * Represents a record of paths for different languages.
 * Key: Language code (e.g., 'en', 'fr').
 * Value: A path for that language (ex: /en/about or /fr/a-propos).
 *
 * @example
 * ```typescript
 * const paths: I18nPaths = {
 *   en: '/en/employee/profile',
 *   fr: '/fr/employe/profil'
 * };
 * ```
 */
type I18nPaths = Record<Language, string>;

/**
 * A utility type that extracts the file path from an I18nPageRoute type.
 * @template T - The type to extract the file from.
 *
 * @example
 * ```typescript
 * // Given this route:
 * const route = {
 *   id: 'EMPL-0001',
 *   file: 'routes/employee/index.tsx',
 *   paths: { en: '/en/employee', fr: '/fr/employe' }
 * };
 * // ExtractI18nRouteFile<typeof route> = 'routes/employee/index.tsx'
 * ```
 */
type ExtractI18nRouteFile<T> = T extends I18nPageRoute ? T['file'] : never;

/**
 * A utility type that extracts the id from an I18nPageRoute type.
 * @template T - The type to extract the id from.
 *
 * @example
 * ```typescript
 * // Given this route:
 * const route = {
 *   id: 'EMPL-0001',
 *   file: 'routes/employee/index.tsx',
 *   paths: { en: '/en/employee', fr: '/fr/employe' }
 * };
 * // ExtractI18nRouteId<typeof route> = 'EMPL-0001'
 * ```
 */
type ExtractI18nRouteId<T> = T extends I18nPageRoute ? T['id'] : never;

/**
 * A utility type that recursively extracts all file paths from an array of I18nRoute objects.
 * This type traverses layout routes to collect all page route files.
 *
 * @template T - The type of the I18nRoute array.
 *
 * @example
 * ```typescript
 * // Given routes with these files:
 * // - 'routes/layout.tsx' (layout)
 * //   - 'routes/employee/index.tsx' (page)
 * //   - 'routes/employee/profile.tsx' (page)
 * // ExtractI18nRouteFiles will return:
 * // 'routes/employee/index.tsx' | 'routes/employee/profile.tsx'
 * ```
 */
type ExtractI18nRouteFiles<T> = T extends I18nLayoutRoute
  ? ExtractI18nRouteFiles<T['children'][number]> //
  : ExtractI18nRouteFile<T>;

/**
 * A utility type that recursively extracts all ids from an array of I18nRoute objects.
 * This type traverses layout routes to collect all page route IDs.
 *
 * @template T - The type of the I18nRoute array.
 *
 * @example
 * ```typescript
 * // Given routes with these IDs:
 * // - Layout (no ID)
 * //   - 'EMPL-0001' (page)
 * //   - 'EMPL-0002' (page)
 * // ExtractI18nRouteIds will return:
 * // 'EMPL-0001' | 'EMPL-0002'
 * ```
 */
type ExtractI18nRouteIds<T> = T extends I18nLayoutRoute
  ? ExtractI18nRouteIds<T['children'][number]> //
  : ExtractI18nRouteId<T>;

/**
 * Represents a route that can be either a layout route or a page route.
 *
 * Layout routes contain child routes but no paths of their own.
 * Page routes have specific paths and render content.
 *
 * @example
 * ```typescript
 * // Layout route
 * const layoutRoute: I18nRoute = {
 *   file: 'routes/layout.tsx',
 *   children: [...]
 * };
 *
 * // Page route
 * const pageRoute: I18nRoute = {
 *   id: 'EMPL-0001',
 *   file: 'routes/employee/index.tsx',
 *   paths: { en: '/en/employee', fr: '/fr/employe' }
 * };
 * ```
 */
export type I18nRoute = I18nLayoutRoute | I18nPageRoute;

/**
 * Represents a layout route, which contains other routes as children.
 * Layout routes provide shared UI structure (headers, footers, navigation)
 * for their child routes.
 *
 * @property file - The file path for the layout component.
 * @property children - An array of child I18nRoute objects.
 *
 * @example
 * ```typescript
 * const layoutRoute: I18nLayoutRoute = {
 *   file: 'routes/layout.tsx',
 *   children: [
 *     { id: 'EMPL-0001', file: 'routes/employee/index.tsx', paths: {...} },
 *     { id: 'EMPL-0002', file: 'routes/employee/profile.tsx', paths: {...} }
 *   ]
 * };
 * ```
 */
export type I18nLayoutRoute = { file: string; children: I18nRoute[] };

/**
 * Represents a page route, which has specific paths for different languages.
 * Page routes are the leaves of the route tree and render actual page content.
 *
 * @property id - A unique identifier for the route (e.g., 'EMPL-0001', 'HRAD-0002').
 *               Format: [PREFIX]-[NUMBER] where PREFIX identifies the section.
 * @property file - The file path for the page component relative to app/.
 * @property paths - An I18nPaths object containing paths for each supported language.
 *                   Each path should follow the same structure, only translated.
 *
 * @example
 * ```typescript
 * const pageRoute: I18nPageRoute = {
 *   id: 'EMPL-0002',
 *   file: 'routes/employee/profile/privacy-consent.tsx',
 *   paths: {
 *     en: '/en/employee/profile/privacy-consent',
 *     fr: '/fr/employe/profil/consentement-a-la-confidentialite'
 *   }
 * };
 * ```
 */
export type I18nPageRoute = { id: string; file: string; paths: I18nPaths };

/**
 * Represents all file paths used in the i18n routes.
 * This is a union type of all file paths from page routes.
 * TypeScript will ensure only valid file paths can be used in type-safe contexts.
 *
 * @example
 * ```typescript
 * // Valid usage
 * const file: I18nRouteFile = 'routes/employee/index.tsx';
 *
 * // TypeScript error: not a valid route file
 * const invalid: I18nRouteFile = 'routes/nonexistent.tsx';
 * ```
 */
export type I18nRouteFile = ExtractI18nRouteFiles<(typeof i18nRoutes)[number]>;

/**
 * Represents all route IDs used in the i18n routes.
 * This is a union type of all route IDs from page routes.
 * TypeScript will ensure only valid IDs can be used in type-safe contexts.
 *
 * @example
 * ```typescript
 * // Valid usage
 * const id: I18nRouteId = 'EMPL-0001';
 *
 * // TypeScript error: not a valid route ID
 * const invalid: I18nRouteId = 'FAKE-0000';
 * ```
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
 * filenames can be extracted and strongly typed as I18nRouteFile.
 *
 * These routes exist in a separate module from routes.ts so they can
 * be imported into clientside code without triggering side effects.
 *
 * ## Route Organization
 *
 * Routes are organized by user role:
 * - PROT-*: Protected/public routes
 * - EMPL-*: Employee routes
 * - HRAD-*: HR Advisor routes
 * - HIRE-*: Hiring Manager routes
 *
 * ## Best Practices
 *
 * 1. **IDs**: Use consistent prefixes and sequential numbering
 * 2. **Paths**: Keep URL structure parallel between languages
 * 3. **Translation**: Translate all path segments for consistency
 * 4. **Parameters**: Use the same parameter names in both languages (e.g., :profileId)
 *
 * @see https://reactrouter.com for React Router documentation
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
          fr: '/fr/employe/profil/informations-sur-lemploi',
        },
      },
      {
        id: 'EMPL-0006',
        file: 'routes/employee/profile/referral-preferences.tsx',
        paths: {
          en: '/en/employee/profile/referral-preferences',
          fr: '/fr/employe/profil/preferences-de-presentation-de-canditure',
        },
      },
      {
        id: 'HRAD-0001',
        file: 'routes/hr-advisor/index.tsx',
        paths: {
          en: '/en/hr-advisor',
          fr: '/fr/conseiller-rh',
        },
      },
      {
        id: 'HRAD-0002',
        file: 'routes/hr-advisor/employees.tsx',
        paths: {
          en: '/en/hr-advisor/employees',
          fr: '/fr/conseiller-rh/employes',
        },
      },
      {
        id: 'HRAD-0003',
        file: 'routes/hr-advisor/employee-profile/index.tsx',
        paths: {
          en: '/en/hr-advisor/employee-profile/:profileId',
          fr: '/fr/conseiller-rh/employe-profil/:profileId',
        },
      },
      {
        id: 'HRAD-0004',
        file: 'routes/hr-advisor/employee-profile/personal-information.tsx',
        paths: {
          en: '/en/hr-advisor/employee-profile/personal-information/:profileId',
          fr: '/fr/conseiller-rh/employe-profil/informations-personnelles/:profileId',
        },
      },
      {
        id: 'HRAD-0005',
        file: 'routes/hr-advisor/employee-profile/employment-information.tsx',
        paths: {
          en: '/en/hr-advisor/employee-profile/employment-information/:profileId',
          fr: '/fr/conseiller-rh/employe-profil/informations-sur-lemploi/:profileId',
        },
      },
      {
        id: 'HRAD-0006',
        file: 'routes/hr-advisor/employee-profile/referral-preferences.tsx',
        paths: {
          en: '/en/hr-advisor/employee-profile/referral-preferences/:profileId',
          fr: '/fr/conseiller-rh/employe-profil/preferences-de-presentation-de-canditure/:profileId',
        },
      },
      {
        id: 'HRAD-0007',
        file: 'routes/hr-advisor/requests.tsx',
        paths: {
          en: '/en/hr-advisor/requests',
          fr: '/fr/conseiller-rh/demandes',
        },
      },
      {
        id: 'HRAD-0008',
        file: 'routes/hr-advisor/request/index.tsx',
        paths: {
          en: '/en/hr-advisor/request/:requestId',
          fr: '/fr/conseiller-rh/demande/:requestId',
        },
      },
      {
        id: 'HRAD-0009',
        file: 'routes/hr-advisor/request/process-information.tsx',
        paths: {
          en: '/en/hr-advisor/request/:requestId/process-information',
          fr: '/fr/conseiller-rh/demande/:requestId/informations-processus',
        },
      },
      {
        id: 'HRAD-0010',
        file: 'routes/hr-advisor/request/position-information.tsx',
        paths: {
          en: '/en/hr-advisor/request/:requestId/position-information',
          fr: '/fr/conseiller-rh/demande/:requestId/informations-poste',
        },
      },
      {
        id: 'HRAD-0011',
        file: 'routes/hr-advisor/request/somc-conditions.tsx',
        paths: {
          en: '/en/hr-advisor/request/:requestId/somc-conditions',
          fr: '/fr/conseiller-rh/demande/:requestId/cmc-conditions',
        },
      },
      {
        id: 'HRAD-0012',
        file: 'routes/hr-advisor/request/submission-details.tsx',
        paths: {
          en: '/en/hr-advisor/request/:requestId/submission-details',
          fr: '/fr/conseiller-rh/demande/:requestId/details-soumission',
        },
      },
      {
        id: 'HRAD-0013',
        file: 'routes/hr-advisor/request/matches.tsx',
        paths: {
          en: '/en/hr-advisor/request/:requestId/matches',
          fr: '/fr/conseiller-rh/demande/:requestId/correspondances',
        },
      },
      {
        id: 'HRAD-0014',
        file: 'routes/hr-advisor/request/profile.tsx',
        paths: {
          en: '/en/hr-advisor/request/:requestId/profile/:profileId',
          fr: '/fr/conseiller-rh/demande/:requestId/profil/:profileId',
        },
      },
      {
        id: 'HRAD-0015',
        file: 'routes/hr-advisor/request/match.tsx',
        paths: {
          en: '/en/hr-advisor/request/:requestId/match/:profileId',
          fr: '/fr/conseiller-rh/demande/:requestId/correspondance/:profileId',
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
