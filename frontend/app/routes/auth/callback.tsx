import { redirect } from 'react-router';

import type { Route } from './+types/callback';

import type { AuthenticationStrategy } from '~/.server/auth/auth-strategies';
import { AzureADAuthenticationStrategy, LocalAuthenticationStrategy } from '~/.server/auth/auth-strategies';
import { serverEnvironment } from '~/.server/environment';
import { LogFactory } from '~/.server/logging';
import { withSpan } from '~/.server/utils/telemetry-utils';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

/**
 * Allows errors to be handled by root.tsx
 */
export default function Callback() {
  return <></>;
}

/**
 * Handles the authentication callback for a given provider.
 */
export async function loader({ context, params, request }: Route.LoaderArgs) {
  const provider = params['*'];

  const currentUrl = new URL(request.url);
  const { session } = context.get(context.applicationContext);
  const log = LogFactory.getLogger(import.meta.url);
  log.info('Auth callback loader invoked', { provider, url: currentUrl.toString() });

  switch (provider) {
    case 'azuread': {
      const { AZUREAD_ISSUER_URL, AZUREAD_CLIENT_ID } = serverEnvironment;
      const AZUREAD_CLIENT_SECRET = serverEnvironment.AZUREAD_CLIENT_SECRET?.value();

      if (!AZUREAD_ISSUER_URL || !AZUREAD_CLIENT_ID || !AZUREAD_CLIENT_SECRET) {
        log.error('Azure AD OIDC settings are misconfigured');
        throw new AppError('The Azure OIDC settings are misconfigured', ErrorCodes.MISCONFIGURED_PROVIDER);
      }

      const authStrategy = new AzureADAuthenticationStrategy(
        new URL(AZUREAD_ISSUER_URL),
        AZUREAD_CLIENT_ID,
        AZUREAD_CLIENT_SECRET,
      );

      const callbackUrl = new URL(`/auth/callback/${provider}`, currentUrl.origin);
      return await handleCallback(authStrategy, callbackUrl, currentUrl, session);
    }

    case 'local': {
      const { ENABLE_DEVMODE_OIDC } = serverEnvironment;

      if (!ENABLE_DEVMODE_OIDC) {
        log.warn('Local OIDC provider requested but devmode is disabled');
        return Response.json(null, { status: HttpStatusCodes.NOT_FOUND });
      }

      const authStrategy = new LocalAuthenticationStrategy(
        new URL('/auth/oidc', currentUrl.origin),
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000000',
      );

      const callbackUrl = new URL(`/auth/callback/${provider}`, currentUrl.origin);
      return await handleCallback(authStrategy, callbackUrl, currentUrl, session);
    }

    default: {
      log.warn('Unknown auth provider', { provider });
      return Response.json('Authentication provider not found', { status: HttpStatusCodes.NOT_FOUND });
    }
  }
}

/**
 * Handles the callback request for a given authentication strategy.
 * Exchanges the authorization code for an access token and ID token.
 */
async function handleCallback(
  authStrategy: AuthenticationStrategy, //
  callbackUrl: URL,
  currentUrl: URL,
  session: AppSession,
) {
  return withSpan('routes.auth.callback.handle_callback', async (span) => {
    span.setAttribute('request_url', currentUrl.toString());
    span.setAttribute('strategy', authStrategy.name);
    const log = LogFactory.getLogger(import.meta.url);
    log.debug('Handling auth provider callback', { strategy: authStrategy.name });

    if (session.loginState === undefined) {
      span.addEvent('login_state.invalid');
      log.warn('Login state missing from session');
      return Response.json({ message: 'Invalid login state' }, { status: HttpStatusCodes.BAD_REQUEST });
    }

    const { codeVerifier, nonce, state } = session.loginState;

    span.addEvent('token_exchange.start');
    const tokenSet = await authStrategy.exchangeAuthCode(callbackUrl, currentUrl.searchParams, nonce, state, codeVerifier);
    span.addEvent('token_exchange.success');
    log.info('Token exchange success', { strategy: authStrategy.name });

    const returnUrl = new URL(session.loginState.returnUrl ?? '/', currentUrl.origin);
    span.setAttribute('return_url', returnUrl.toString());
    log.debug('Redirecting after auth', { returnUrl: returnUrl.toString() });

    delete session.loginState;

    session.authState = {
      accessToken: tokenSet.accessToken,
      accessTokenClaims: tokenSet.accessTokenClaims,
      idToken: tokenSet.idToken,
      idTokenClaims: tokenSet.idTokenClaims,
    };

    return redirect(returnUrl.toString());
  });
}
