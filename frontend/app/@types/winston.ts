/**
 * Type declarations for extending the Winston logging module.
 *
 * This file augments Winston's type definitions to support our application's
 * custom log levels. By extending the Logger interface, we ensure that
 * TypeScript recognizes our additional logging methods beyond Winston's
 * default levels (error, warn, info, debug).
 */
import type winston from 'winston';

import type { LogLevel } from '~/.server/logging';

/**
 * Augment the Winston Logger interface to include our custom log levels.
 *
 * This module declaration extends Winston's Logger interface to include
 * methods for our custom log levels ('none', 'error', 'warn', 'info', 'audit', 'debug', 'trace').
 * Without this extension, TypeScript would not recognize these custom logging methods
 * on logger instances, leading to type errors when using our extended logging API.
 */
declare module 'winston' {
  interface Logger extends Record<LogLevel, winston.LeveledLogMethod> {}
}

// Required empty export to ensure this file is treated as a module by TypeScript,
// allowing the module augmentation above to be properly scoped and applied.
export {};
