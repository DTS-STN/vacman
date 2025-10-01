import { trace } from '@opentelemetry/api';
import type { RequestHandler } from 'express';
import sessionMiddleware from 'express-session';
import { minimatch } from 'minimatch';
import morganMiddleware from 'morgan';
import { randomUUID } from 'node:crypto';

import type { ServerEnvironment } from '~/.server/environment';
import { createMemoryStore, createRedisStore } from '~/.server/express/session';
import { LogFactory } from '~/.server/logging';
import { getRequestContext, runWithRequestContext } from '~/.server/utils/request-context';
import { generateCorrelationId } from '~/utils/correlation';

const log = LogFactory.getLogger(import.meta.url);

/**
 * Checks if a given path should be ignored based on a list of ignore patterns.
 *
 * @param ignorePatterns - An array of glob patterns to match against the path.
 * @param path - The path to check.
 * @returns - True if the path should be ignored, false otherwise.
 */
function shouldIgnore(ignorePatterns: string[], path: string): boolean {
  return ignorePatterns.some((entry) => minimatch(path, entry));
}

/**
 * Configures a logging middleware with appropriate format and filtering.
 */
export function logging(environment: ServerEnvironment): RequestHandler {
  const ignorePatterns = [
    '/__manifest', //
    '/api/readyz',
    '/assets/**',
    '/favicon.ico',
  ];

  const logFormat = environment.isProduction ? 'tiny' : 'dev';

  const middleware = morganMiddleware(logFormat, {
    stream: { write: (str) => log.audit(str.trim()) },
  });

  return (request, response, next) => {
    // Ensure a reqId exists for this request lifecycle
    const existing = request.get('x-correlation-id') ?? undefined;
    const reqId = existing ?? generateCorrelationId();

    // Make reqId available via ALS and response header
    response.setHeader('x-correlation-id', reqId);
    if (shouldIgnore(ignorePatterns, request.path)) {
      // Intentionally do not log a "skipping logging" message.
      return runWithRequestContext({ reqId }, () => next());
    }

    return runWithRequestContext({ reqId }, () => middleware(request, response, next));
  };
}

/**
 * Sets various security headers to protect the application.
 */
export function security(environment: ServerEnvironment): RequestHandler {
  const ignorePatterns: string[] = [
    /* intentionally left blank */
  ];

  return (request, response, next) => {
    if (shouldIgnore(ignorePatterns, request.path)) {
      log.trace('Skipping adding security headers to response: [%s]', request.path);
      return next();
    }

    response.locals.nonce = randomUUID();
    log.trace('Adding nonce [%s] to response', response.locals.nonce);

    const contentSecurityPolicy = [
      `base-uri 'none'`,
      `default-src 'none'`,
      `connect-src 'self'` + (environment.isProduction ? '' : ' ws://localhost:3001'),
      `font-src 'self' fonts.gstatic.com use.fontawesome.com www.canada.ca`,
      `form-action 'self'`,
      `frame-ancestors 'self'`,
      `frame-src 'self'`,
      `img-src 'self' data: www.canada.ca`,
      `object-src data:`,
      `script-src 'self' 'nonce-${response.locals.nonce}'`,
      // NOTE: unsafe-inline is required by Radix Primitives 💩
      // see https://github.com/radix-ui/primitives/discussions/3130
      `style-src 'self' 'unsafe-inline' fonts.googleapis.com use.fontawesome.com www.canada.ca`,
    ].join('; ');

    const permissionsPolicy = [
      'camera=()',
      'display-capture=()',
      'fullscreen=()',
      'geolocation=()',
      'interest-cohort=()',
      'microphone=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
    ].join(', ');

    log.trace('Adding security headers to response');
    response.setHeader('Permissions-Policy', permissionsPolicy);
    response.setHeader('Content-Security-Policy', contentSecurityPolicy);
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Server', 'webserver');
    response.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'deny');
    next();
  };
}

/**
 * Configures session middleware, optionally skipping it for bots and specific paths.
 */
export function session(environment: ServerEnvironment): RequestHandler {
  const ignorePatterns = ['/__manifest', '/api/**'];

  const {
    isProduction,
    SESSION_TYPE,
    SESSION_COOKIE_DOMAIN,
    SESSION_COOKIE_NAME,
    SESSION_COOKIE_PATH,
    SESSION_COOKIE_SAMESITE,
    SESSION_COOKIE_SECRET,
    SESSION_COOKIE_SECURE,
  } = environment;

  const sessionStore =
    SESSION_TYPE === 'redis' //
      ? createRedisStore(environment)
      : createMemoryStore();

  const middleware = sessionMiddleware({
    store: sessionStore,
    name: SESSION_COOKIE_NAME,
    secret: [SESSION_COOKIE_SECRET.value()],
    genid: () => randomUUID(),
    proxy: true,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: {
      domain: SESSION_COOKIE_DOMAIN,
      path: SESSION_COOKIE_PATH,
      secure: SESSION_COOKIE_SECURE ? isProduction : false,
      httpOnly: true,
      sameSite: SESSION_COOKIE_SAMESITE,
    },
  });

  return (request, response, next) => {
    if (shouldIgnore(ignorePatterns, request.path)) {
      log.trace('Skipping session: [%s]', request.path);
      return next();
    }

    return middleware(request, response, next);
  };
}

/**
 * Confitures the tracing middleware that adds information to the active span for each request.
 */
export function tracing(): RequestHandler {
  const ignorePatterns: string[] = [
    /* intentionally left blank */
  ];

  return (request, response, next) => {
    if (shouldIgnore(ignorePatterns, request.path)) {
      log.trace('Skipping tracing: [%s]', request.path);
      return next();
    }

    const span = trace.getActiveSpan();

    const { pathname } = new URL(request.url, 'http://localhost:3000/');
    const spanName = `${request.method} ${pathname}`;
    log.trace('Updating span name to match request: [%s]', spanName);
    span?.updateName(spanName);

    // Attach correlation id to response (fallback if not already set)
    const ctx = getRequestContext();
    if (ctx?.reqId) {
      response.setHeader('x-correlation-id', ctx.reqId);
    }

    return next();
  };
}
