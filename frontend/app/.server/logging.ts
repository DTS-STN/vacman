/**
 * This module provides a centralized logging configuration for the application.
 * It uses the `winston` library to create and manage loggers, allowing for
 * structured logging with various levels (none, error, warn, info, audit, debug, trace).
 * The module supports console logging and includes features for formatting log messages,
 * handling exceptions and rejections, and dynamically adjusting the log level based on
 * environment variables. It also provides a factory for creating and retrieving logger
 * instances for different categories within the application.
 */
import util from 'node:util';
import type { Logform, Logger } from 'winston';
import winston, { format, transports } from 'winston';
import { fullFormat } from 'winston-error-format';

import { getRequestContext } from '~/.server/utils/request-context';

/**
 * Defines a constant object representing logging levels.
 * This object provides a mapping between string names and their corresponding integer values for logging levels.
 */
export const logLevels = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  audit: 4,
  debug: 5,
  trace: 6,
} as const;

export type LogLevel = keyof typeof logLevels;

const consoleTransport = new transports.Console({
  handleExceptions: true,
  handleRejections: true,
});

export const LogFactory = {
  /**
   * Gets a logger instance for the specified category.
   *
   * Creates a new logger instance with a configured format and console transport if it doesn't exist for the provided category.
   * Otherwise, retrieves the existing logger.
   */
  getLogger: (category: string): Logger => {
    if (winston.loggers.has(category)) {
      return winston.loggers.get(category);
    }

    // accommodate the extra uncaughtException and unhandledRejection listeners used by the console transport
    // This fixes the following warnigns that are logged by nodejs: MaxListenersExceededWarning: Possible EventEmitter memory leak detected
    // see: https://github.com/winstonjs/winston/blob/v3.17.0/lib/winston/exception-handler.js#L51
    // see: https://github.com/winstonjs/winston/blob/v3.17.0/lib/winston/rejection-handler.js#L51
    const maxListeners = process.getMaxListeners();
    process.setMaxListeners(maxListeners + 2);

    const logger = winston.loggers.add(category, {
      level: getLogLevel(),
      levels: logLevels,
      format: format.combine(
        format.label({ label: category }),
        format.timestamp(),
        format.splat(),
        fullFormat({ stack: true }),
        format.printf(asFormattedInfo),
      ),
      transports: [consoleTransport],
    });

    logger.trace('process.maxListeners increased to %s', process.getMaxListeners());

    return logger;
  },
  /**
   * Returns a child logger with default metadata attached to every log line.
   */
  getScoped: (category: string, meta: Record<string, unknown>): Logger => {
    const base = LogFactory.getLogger(category);
    return base.child(meta);
  },
  /**
   * Returns a logger that automatically includes the current request's reqId (if present).
   * Falls back to a plain category logger if no request context exists.
   */
  getRequestLogger: (category: string): Logger => {
    const ctx = getRequestContext();
    if (ctx?.reqId) {
      return LogFactory.getScoped(category, { reqId: ctx.reqId });
    }
    return LogFactory.getLogger(category);
  },
};

/**
 * Formats a log message for output.
 *
 * This function takes a Logform.TransformableInfo object and returns a formatted string.
 * The formatted string includes the timestamp, level, label, message, and any additional metadata.
 */
function asFormattedInfo(transformableInfo: Logform.TransformableInfo): string {
  const { label, level, message, timestamp, ...rest } = transformableInfo;
  const formattedInfo = `${timestamp} ${level.toUpperCase().padStart(7)} --- [${formatLabel(`${label}`, 25)}]: ${message}`;
  const sanitizedRest = sanitizeRest(Object.fromEntries(Object.entries(rest).filter(([key]) => typeof key !== 'symbol')));
  return isEmpty(sanitizedRest) ? formattedInfo : `${formattedInfo} --- ${util.inspect(sanitizedRest, false, null, true)}`;
}

/**
 * Checks if an object is empty.
 *
 * @param obj - The object to check.
 * @returns `true` if the object is empty, `false` otherwise.
 */
function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Formats a label string to a specified size.
 * If the label is longer than the specified size, it truncates the label and adds an ellipsis (...) at the beginning.
 */
function formatLabel(label: string, size: number): string {
  return label.length > size ? `…${label.slice(-size + 1)}` : label.padStart(size);
}

/**
 * Retrieves the log level from the environment variables.
 * This function checks the `LOG_LEVEL` environment variable. If it's undefined
 * or empty, it defaults to 'info' in production and 'debug' in other
 * environments.
 */
function getLogLevel(): string {
  const { LOG_LEVEL } = process.env;

  if (LOG_LEVEL === undefined || LOG_LEVEL === '') {
    return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
  }

  return LOG_LEVEL;
}

// --- Enhancements: redaction + helpers ---

const REDACT_KEYS = new Set(['authorization', 'accessToken', 'token', 'password', 'secret', 'cookie', 'set-cookie']);

function sanitizeRest(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = k.toLowerCase();
    if (REDACT_KEYS.has(key)) {
      out[k] = '[REDACTED]';
      continue;
    }
    if (v instanceof Error) {
      out[k] = { name: v.name, message: v.message, stack: v.stack };
      continue;
    }
    if (v && typeof v === 'object') {
      if (Array.isArray(v)) {
        out[k] = v.map((item) => (item && typeof item === 'object' ? sanitizeRest(item as Record<string, unknown>) : item));
      } else {
        out[k] = sanitizeRest(v as Record<string, unknown>);
      }
      continue;
    }
    out[k] = v;
  }
  return out;
}

/** Compute elapsed milliseconds (rounded) since start */
export function msSince(startMs: number): number {
  return Math.round((Date.now() - startMs) * 1000) / 1000;
}
