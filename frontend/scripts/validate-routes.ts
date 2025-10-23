#!/usr/bin/env tsx
/**
 * Route validation script
 *
 * Validates the i18n route configuration to catch common issues:
 * - Duplicate route IDs
 * - Missing or invalid file paths
 * - Path conflicts between routes
 * - Missing language paths
 */
import { matchPath } from 'react-router';

import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { I18nPageRoute, I18nRoute } from '../app/i18n-routes';
import { i18nRoutes, isI18nLayoutRoute, isI18nPageRoute } from '../app/i18n-routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ValidationError {
  type: 'duplicate_id' | 'missing_file' | 'path_conflict' | 'missing_path';
  message: string;
  route?: I18nPageRoute;
}

const errors: ValidationError[] = [];
const seenIds = new Set<string>();
const allPageRoutes: I18nPageRoute[] = [];

/**
 * Recursively collect all page routes from the route tree
 */
function collectPageRoutes(routes: I18nRoute[]): void {
  for (const route of routes) {
    if (isI18nLayoutRoute(route)) {
      collectPageRoutes(route.children);
    } else if (isI18nPageRoute(route)) {
      allPageRoutes.push(route);
    }
  }
}

/**
 * Validate that route IDs are unique
 */
function validateUniqueIds(): void {
  for (const route of allPageRoutes) {
    if (seenIds.has(route.id)) {
      errors.push({
        type: 'duplicate_id',
        message: `Duplicate route ID: ${route.id}`,
        route,
      });
    }
    seenIds.add(route.id);
  }
}

/**
 * Validate that file paths exist
 */
function validateFilePaths(): void {
  const appDir = resolve(__dirname, '../app');

  for (const route of allPageRoutes) {
    const filePath = resolve(appDir, route.file);
    if (!existsSync(filePath)) {
      errors.push({
        type: 'missing_file',
        message: `File not found: ${route.file}`,
        route,
      });
    }
  }
}

/**
 * Validate that all routes have paths for all required languages
 */
function validateLanguagePaths(): void {
  const requiredLanguages: Language[] = ['en', 'fr'];

  for (const route of allPageRoutes) {
    for (const lang of requiredLanguages) {
      if (!route.paths[lang]) {
        errors.push({
          type: 'missing_path',
          message: `Missing ${lang} path for route ${route.id}`,
          route,
        });
      }
    }
  }
}

/**
 * Validate that paths don't conflict with each other
 */
function validatePathConflicts(): void {
  const languages: Language[] = ['en', 'fr'];

  for (const lang of languages) {
    const pathsForLang = allPageRoutes.map((r) => ({
      route: r,
      path: r.paths[lang],
    }));

    // Check each path against all others
    for (let i = 0; i < pathsForLang.length; i++) {
      for (let j = i + 1; j < pathsForLang.length; j++) {
        const route1 = pathsForLang[i];
        const route2 = pathsForLang[j];

        // Skip if either route or path is undefined
        if (!route1 || !route2 || !route1.path || !route2.path) continue;

        // Check if paths would match each other
        // This catches conflicts like /foo/:id matching /foo/bar
        const match1 = matchPath(route1.path, route2.path);
        const match2 = matchPath(route2.path, route1.path);

        if (match1 || match2) {
          // Only report if they're not identical (identical is fine for testing)
          if (route1.path !== route2.path) {
            errors.push({
              type: 'path_conflict',
              message: `Path conflict (${lang}): "${route1.path}" (${route1.route.id}) conflicts with "${route2.path}" (${route2.route.id})`,
            });
          }
        }
      }
    }
  }
}

/**
 * Run all validations
 */
function validate(): void {
  console.log('🔍 Validating i18n routes...\n');

  // Collect all routes
  collectPageRoutes(i18nRoutes);
  console.log(`Found ${allPageRoutes.length} page routes\n`);

  // Run validations
  validateUniqueIds();
  validateFilePaths();
  validateLanguagePaths();
  validatePathConflicts();

  // Report results
  if (errors.length === 0) {
    console.log('✅ All validations passed!\n');
    process.exit(0);
  } else {
    console.error(`❌ Found ${errors.length} validation error(s):\n`);

    // Group errors by type
    const errorsByType = errors.reduce(
      (acc, error) => {
        const key = error.type;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key]!.push(error);
        return acc;
      },
      {} as Record<string, ValidationError[]>,
    );

    // Print errors by type
    for (const [type, typeErrors] of Object.entries(errorsByType)) {
      console.error(`\n${type.toUpperCase().replace(/_/g, ' ')}:`);
      for (const error of typeErrors) {
        console.error(`  • ${error.message}`);
      }
    }

    console.error('\n');
    process.exit(1);
  }
}

// Run validation
validate();
