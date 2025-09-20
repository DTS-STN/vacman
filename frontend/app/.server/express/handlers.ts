import { createRequestHandler } from '@react-router/express';
import { RouterContextProvider } from 'react-router';

import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import path from 'node:path';
import type { ViteDevServer } from 'vite';

import { applicationContext } from '~/.server/application-context';
import { serverEnvironment } from '~/.server/environment';
import { LogFactory } from '~/.server/logging';
import { HttpStatusCodes } from '~/errors/http-status-codes';

const log = LogFactory.getLogger(import.meta.url);

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

  return createRequestHandler({
    mode: serverEnvironment.NODE_ENV,
    getLoadContext: (request, response) => {
      const contextProvider = new RouterContextProvider();

      contextProvider.set(applicationContext, {
        nonce: response.locals.nonce,
        session: request.session,
      });

      ///
      /// TODO ::: GjB ::: overriding RouterContextProvider here facilitates an incremental adoption of RRv7 middleware
      ///                  obviously, this should be removed once the full migration to RRv7 middleware is complete
      ///                  see: https://reactrouter.com/how-to/middleware#migration-from-apploadcontext
      ///
      Object.assign(contextProvider, contextProvider.get(applicationContext));

      return contextProvider;
    },
    build: viteDevServer //
      ? () => viteDevServer.ssrLoadModule('virtual:react-router/server-build')
      : () => import(rrServerBuild),
  });
}
