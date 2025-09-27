import { createRequestHandler } from '@react-router/express';
import { createContext, RouterContextProvider } from 'react-router';

import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import path from 'node:path';
import type { ViteDevServer } from 'vite';

import { serverEnvironment } from '~/.server/environment';
import { LogFactory } from '~/.server/logging';
import { HttpStatusCodes } from '~/errors/http-status-codes';

const log = LogFactory.getLogger(import.meta.url);

/**
 * The ApplicationContext represents the data that will be handed from
 * our custom express server to our React Router application.
 */
export type ApplicationContext = {
  readonly nonce: string;
  readonly session: AppSession;
};

export function globalErrorHandler(): ErrorRequestHandler {
  return (error: unknown, request: Request, response: Response, next: NextFunction) => {
    log.error('Unexpected error caught by express server', error);

    if (response.headersSent) {
      log.error('Response headers have already been sent; skipping friendly error page');
      return next(error);
    }

    // TODO :: GjB
    // This should probably be a collection of error pages
    // for common scenarios that we might encounter in express.
    // ex: 401, 403, 504, 500, 503, etc

    const errorFile =
      response.statusCode === HttpStatusCodes.FORBIDDEN //
        ? './assets/403.html'
        : './assets/500.html';

    const errorFilePath = path.join(import.meta.dirname, errorFile);

    response.status(response.statusCode).sendFile(errorFilePath, (dispatchError: unknown) => {
      if (dispatchError) {
        log.error('Unexpected error while dispatching error page... this is bad!', dispatchError);
        response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
      }
    });
  };
}

export function rrRequestHandler(viteDevServer?: ViteDevServer) {
  // dynamically declare the path to avoid static analysis errors 💩
  const rrServerBuild = './app.js';

  // create the context outside of the handler, since it contains no request-bound data
  const applicationContext = createContext<ApplicationContext>();

  return createRequestHandler({
    mode: serverEnvironment.NODE_ENV,
    getLoadContext: (request, response) => {
      const contextProvider = new RouterContextProvider();

      contextProvider.set(applicationContext, {
        nonce: response.locals.nonce,
        session: request.session,
      });

      //
      // TODO ::: GjB ::: Remove this compatibility layer once the migration to RRv7 middleware is complete.
      //
      // This block of code provides backward compatibility for our existing app structure
      // during the incremental adoption of the new RouterContextProvider pattern.
      // see: https://reactrouter.com/how-to/middleware#migration-from-apploadcontext
      //
      // There are two things happening here:
      //
      // 1. `Object.assign(contextProvider, contextProvider.get(applicationContext))`
      //    This takes the values from our `applicationContext` (like `session` and `nonce`)
      //    and adds them directly to the top level of the `contextProvider`. Existing parts
      //    of the app expect these values on the root `loader` context, and this keeps them working.
      //
      // 2. `Object.assign(contextProvider, { applicationContext })`
      //    This adds the `applicationContext` object itself to the provider. We need this so the RRv7
      //    framework can access the context instance. We can't simply export/import it because Vite's
      //    SSR module handling can create different instances of the module, leading to context mismatches.
      //    Attaching it here ensures we always get the correct instance.
      //
      Object.assign(contextProvider, { applicationContext });
      Object.assign(contextProvider, contextProvider.get(applicationContext));

      return contextProvider;
    },
    build: viteDevServer //
      ? () => viteDevServer.ssrLoadModule('virtual:react-router/server-build')
      : () => import(rrServerBuild),
  });
}
