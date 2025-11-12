/**
 * Global type declarations for the application.
 *
 * This file extends TypeScript's global namespace to declare application-specific
 * types, global variables, and utility types used throughout the codebase.
 * These declarations provide type safety for global objects and custom types
 * that are injected at runtime or used across modules.
 */
import type { RouteModules } from 'react-router';

import type { Request } from 'express';

import type { ClientEnvironment } from '~/.server/environment';
import type { InstanceName } from '~/.server/utils/instance-registry';

declare global {
  /**
   * The application's session type, extracted from Express Request.
   * This provides type-safe access to the custom session data defined in
   * express-session augmentations.
   */
  type AppSession = Request['session'];

  /**
   * The application's supported languages: English and French.
   */
  type Language = 'en' | 'fr';

  /**
   * The application's supported user roles for authorization.
   */
  type Role = 'admin' | 'hiring-manager' | 'hr-advisor' | 'employee';

  /**
   * Global variable containing the client-side environment configuration.
   * This is loaded dynamically at runtime via the `/api/client-env` endpoint
   * and provides access to environment variables and configuration needed on the client side.
   */
  var __appEnvironment: ClientEnvironment;

  /**
   * Global registry for application-scoped singleton instances.
   * Used to store and retrieve singleton objects by their registered names.
   */
  var __instanceRegistry: Map<InstanceName, unknown>;

  /**
   * React Router adds the route modules to global scope at runtime,
   * but doesn't declare them anywhere. This declaration provides type safety
   * for accessing route modules globally.
   */
  var __reactRouterRouteModules: RouteModules;

  /**
   * Extract from `T` those types that are assignable to `U`, where `U` must exist in `T`.
   *
   * Similar to `Extract` but requires the extraction list to be composed of valid members of `T`.
   *
   * @see https://github.com/pelotom/type-zoo?tab=readme-ov-file#extractstrictt-u-extends-t
   */
  type ExtractStrict<T, U extends T> = T extends U ? T : never;

  /**
   * Drop keys `K` from `T`, where `K` must exist in `T`.
   *
   * @see https://github.com/pelotom/type-zoo?tab=readme-ov-file#omitstrictt-k-extends-keyof-t
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Using `any` is necessary for distributive conditional types to work properly with union types
  type OmitStrict<T, K extends keyof T> = T extends any ? Pick<T, Exclude<keyof T, K>> : never;
}

// Required empty export to ensure this file is treated as a module by TypeScript,
// allowing the global declarations above to be properly scoped and applied.
export {};
