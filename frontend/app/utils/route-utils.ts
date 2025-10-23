import { matchPath } from 'react-router';

import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import type { I18nPageRoute, I18nRoute, I18nRouteFile } from '~/i18n-routes';
import { isI18nLayoutRoute, isI18nPageRoute } from '~/i18n-routes';

/**
 * Route indexes for O(1) lookup performance
 */
class RouteIndexes {
  private fileToRouteMap: Map<string, I18nPageRoute> | null = null;
  private pathToRouteMap: Map<string, I18nPageRoute> | null = null;

  /**
   * Build indexes from routes
   */
  build(routes: I18nRoute[]): void {
    this.fileToRouteMap = new Map();
    this.pathToRouteMap = new Map();

    const fileMap = this.fileToRouteMap;
    const pathMap = this.pathToRouteMap;

    const collectRoutes = (routeList: I18nRoute[]): void => {
      for (const route of routeList) {
        if (isI18nLayoutRoute(route)) {
          collectRoutes(route.children);
        } else if (isI18nPageRoute(route)) {
          // Index by file
          fileMap.set(route.file, route);

          // Index by paths (both languages)
          for (const lang of ['en', 'fr'] as Language[]) {
            const path = route.paths[lang];
            if (path) {
              pathMap.set(normalizePath(path), route);
            }
          }
        }
      }
    };

    collectRoutes(routes);
  }

  /**
   * Get route by file from index
   */
  getByFile(file: string): I18nPageRoute | undefined {
    if (!this.fileToRouteMap) {
      throw new Error('Route indexes not built. Call build() first.');
    }
    return this.fileToRouteMap.get(file);
  }

  /**
   * Get route by path from index
   */
  getByPath(pathname: string): I18nPageRoute | undefined {
    if (!this.pathToRouteMap) {
      throw new Error('Route indexes not built. Call build() first.');
    }
    return this.pathToRouteMap.get(normalizePath(pathname));
  }

  /**
   * Check if indexes are built
   */
  isBuilt(): boolean {
    return this.fileToRouteMap !== null && this.pathToRouteMap !== null;
  }

  /**
   * Clear indexes
   */
  clear(): void {
    this.fileToRouteMap = null;
    this.pathToRouteMap = null;
  }
}

// Global route indexes instance
const routeIndexes = new RouteIndexes();

/**
 * Recursively searches for a route matching the given file within a structure of I18nRoutes.
 *
 * @param file - The file name of the route to search for.
 * @param routes - The array of I18nRoutes to search within.
 * @returns The I18nPageRoute that matches the given file name, or undefined if no route is found.
 */
export function findRouteByFile(file: string, routes: I18nRoute[]): I18nPageRoute | undefined {
  // Try indexed lookup first
  if (routeIndexes.isBuilt()) {
    return routeIndexes.getByFile(file);
  }

  // Fall back to recursive search
  for (const route of routes) {
    if (isI18nLayoutRoute(route)) {
      const matchingChildRoute = findRouteByFile(file, route.children);

      if (matchingChildRoute) {
        return matchingChildRoute;
      }
    }

    if (isI18nPageRoute(route) && route.file === file) {
      return route;
    }
  }
}

/**
 * Recursively searches for a route matching the given pathname within a structure of I18nRoutes.
 *
 * @param pathname - The pathname of the route to search for.
 * @param routes - The array of I18nRoutes to search within.
 * @returns The I18nPageRoute that matches the given pathname, or undefined if no route is found.
 */
export function findRouteByPath(pathname: string, routes: I18nRoute[]): I18nPageRoute | undefined {
  // Decode URL-encoded characters (e.g., %C3%A9 -> é) before normalizing
  const decodedPathname = decodeURIComponent(pathname);
  const normalizedPathname = normalizePath(decodedPathname);

  // Try indexed lookup first (for exact matches)
  if (routeIndexes.isBuilt()) {
    const indexedRoute = routeIndexes.getByPath(normalizedPathname);
    if (indexedRoute) {
      return indexedRoute;
    }
  }

  // Fall back to recursive search with pattern matching (for parameterized routes)
  for (const route of routes) {
    if (isI18nLayoutRoute(route)) {
      const matchingChildRoute = findRouteByPath(pathname, route.children);
      if (matchingChildRoute) return matchingChildRoute;
    }

    if (isI18nPageRoute(route)) {
      const enMatches = matchPath(normalizePath(route.paths.en), normalizedPathname);
      const frMatches = matchPath(normalizePath(route.paths.fr), normalizedPathname);
      if (enMatches || frMatches) return route;
    }
  }
}

/**
 * Recursively searches for a route matching the given file within a structure of I18nRoutes.
 *
 * @param i18nRouteFile - The file name of the route to search for.
 * @param routes - The array of I18nRoutes to search within.
 * @returns The I18nPageRoute that matches the given file name.
 * @throws An error if no route is found for the given file name.
 */
export function getRouteByFile(i18nRouteFile: I18nRouteFile, routes: I18nRoute[]): I18nPageRoute {
  const route = findRouteByFile(i18nRouteFile, routes);

  if (route === undefined) {
    throw new AppError(`No route found for ${i18nRouteFile} (this should never happen)`, ErrorCodes.ROUTE_NOT_FOUND);
  }

  return route;
}

/**
 * Recursively searches for a route matching the given pathname within a structure of I18nRoutes.
 *
 * @param pathname - The pathname of the route to search for.
 * @param routes - The array of I18nRoutes to search within.
 * @returns The I18nPageRoute that matches the given file name.
 * @throws An error if no route is found for the given file name.
 */
export function getRouteByPath(pathname: string, routes: I18nRoute[]): I18nPageRoute {
  const route = findRouteByPath(pathname, routes);

  if (route === undefined) {
    throw new AppError(`No route found for ${pathname} (this should never happen)`, ErrorCodes.ROUTE_NOT_FOUND);
  }

  return route;
}

/**
 * Normalize a pathname by removing any trailing slashes.
 * @param pathname - The pathname to normalize.
 * @returns The normalized pathname.
 */
function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '');
}

/**
 * Build route indexes for improved lookup performance.
 * This should be called once at application startup.
 *
 * @param routes - The array of I18nRoutes to index.
 */
export function buildRouteIndexes(routes: I18nRoute[]): void {
  routeIndexes.build(routes);
}

/**
 * Clear route indexes. Primarily for testing purposes.
 */
export function clearRouteIndexes(): void {
  routeIndexes.clear();
}
