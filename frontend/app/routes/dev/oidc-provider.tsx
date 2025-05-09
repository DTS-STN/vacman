import { redirect } from 'react-router';

import type { KeyObject } from 'jose';
import { exportJWK, importPKCS8, importSPKI, SignJWT } from 'jose';
import { randomUUID } from 'node:crypto';
import { setTimeout } from 'node:timers';

import type { Route } from './+types/oidc-provider';

import type { TokenSet } from '~/.server/auth/auth-strategies';
import { serverEnvironment } from '~/.server/environment';
import { HttpStatusCodes } from '~/errors/http-status-codes';

type AuthCode = string;

type KeyPair = {
  privateKey: CryptoKey | KeyObject;
  publicKey: CryptoKey | KeyObject;
};

type OidcConfig = {
  allowedRedirectUris: string[];
  clientId: string;
  clientSecret: string;
  issuer: string;
};

// a token cache to hold authcode → token mappings
const tokenCache = new Map<AuthCode, TokenSet>();

/**
 * Handle OIDC actions, such as token exchange.
 */
export async function action({ context, params, request }: Route.ActionArgs) {
  const { ENABLE_DEVMODE_OIDC } = serverEnvironment;

  if (!ENABLE_DEVMODE_OIDC) {
    // return a 404 if devmode OIDC is not enabled
    return Response.json(null, { status: HttpStatusCodes.NOT_FOUND });
  }

  const endpoint = params['*'];

  switch (endpoint) {
    case 'token': {
      return await handleTokenRequest({ context, params, request });
    }

    default: {
      return Response.json('OIDC endpoint not found', { status: HttpStatusCodes.NOT_FOUND });
    }
  }
}

/**
 * Handle OIDC loader requests, such as discovery, user info, etc.
 */
export async function loader({ context, params, request }: Route.LoaderArgs) {
  if (!serverEnvironment.ENABLE_DEVMODE_OIDC) {
    // return a 404 if devmode OIDC is not enabled
    return Response.json(null, { status: HttpStatusCodes.NOT_FOUND });
  }

  const endpoint = params['*'];

  switch (endpoint) {
    case '.well-known/openid-configuration': {
      return handleMetadataRequest({ context, params, request });
    }

    case '.well-known/jwks.json': {
      return await handleJwksRequest();
    }

    case 'authorize': {
      return await handleAuthorizeRequest({ context, params, request });
    }

    case 'userinfo': {
      return handleUserinfoRequest();
    }

    default: {
      return Response.json('OIDC endpoint not found', { status: HttpStatusCodes.NOT_FOUND });
    }
  }
}

/**
 * see: https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationEndpoint
 */
async function handleAuthorizeRequest({ request }: Route.LoaderArgs): Promise<Response> {
  const config = getConfig(new URL(request.url));

  const searchParams = new URL(request.url).searchParams;

  const clientId = searchParams.get('client_id');
  const nonce = searchParams.get('nonce');
  const redirectUri = searchParams.get('redirect_uri');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');

  if (clientId !== config.clientId) {
    return Response.json({ error: 'invalid_client_id' }, { status: HttpStatusCodes.BAD_REQUEST });
  }

  if (!nonce) {
    return Response.json({ error: 'invalid_nonce' }, { status: HttpStatusCodes.BAD_REQUEST });
  }

  if (redirectUri && !config.allowedRedirectUris.includes(redirectUri)) {
    return Response.json({ error: 'invalid_redirect_uri' }, { status: HttpStatusCodes.BAD_REQUEST });
  }

  if (!scope) {
    return Response.json({ error: 'invalid_scope' }, { status: HttpStatusCodes.BAD_REQUEST });
  }

  if (!state) {
    return Response.json({ error: 'invalid_state' }, { status: HttpStatusCodes.BAD_REQUEST });
  }

  //
  // validation passed; generate tokens and return authcode
  //

  const code = randomUUID();
  const { privateKey } = await getKeyPair();

  const accessToken = await new SignJWT({
    name: 'Application Developer',
    scopes: scope.split(' '),
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setAudience(config.clientId)
    .setExpirationTime('24h')
    .setIssuedAt()
    .setIssuer(config.issuer)
    .setSubject('00000000-0000-0000-0000-000000000000')
    .sign(privateKey);

  const idToken = await new SignJWT({
    name: 'Application Developer',
    nonce: nonce,
    roles: ['user'],
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setAudience(config.clientId)
    .setExpirationTime('24h')
    .setIssuedAt()
    .setIssuer(config.issuer)
    .setSubject('00000000-0000-0000-0000-000000000000')
    .sign(privateKey);

  // store in the token cache for 30 seconds (for retrieval during token exchange step)
  tokenCache.set(code, { accessToken, idToken });
  setTimeout(() => tokenCache.delete(code), 30_000);

  return redirect(`${redirectUri}?code=${code}&state=${state}`);
}

/**
 * see: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
 */
function handleMetadataRequest({ request }: Route.LoaderArgs): Response {
  const { issuer } = getConfig(new URL(request.url));

  return Response.json({
    authorization_endpoint: `${issuer}/authorize`,
    claims_supported: ['aud', 'email', 'exp', 'iat', 'iss', 'name', 'sub'],
    id_token_signing_alg_values_supported: ['RS256'],
    issuer: issuer,
    jwks_uri: `${issuer}/.well-known/jwks.json`,
    response_types_supported: ['code id_token', 'id_token token'],
    scopes_supported: ['openid', 'profile', 'email'],
    subject_types_supported: ['public'],
    token_endpoint_auth_methods_supported: ['client_secret_post'],
    token_endpoint: `${issuer}/token`,
    userinfo_endpoint: `${issuer}/userinfo`,
  });
}

/**
 * see: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
 */
async function handleJwksRequest(): Promise<Response> {
  const { publicKey } = await getKeyPair();
  const jwk = await exportJWK(publicKey);
  return Response.json({ keys: [jwk] });
}

/**
 * see: https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint
 */
async function handleTokenRequest({ request }: Route.LoaderArgs): Promise<Response> {
  const config = getConfig(new URL(request.url));

  const formData = await request.formData();

  const clientId = formData.get('client_id')?.toString();
  const clientSecret = formData.get('client_secret')?.toString();
  const code = formData.get('code')?.toString();
  const grantType = formData.get('grant_type')?.toString();
  const redirectUri = formData.get('redirect_uri')?.toString();

  if (clientId !== config.clientId) {
    return Response.json({ error: 'invalid_client' }, { status: HttpStatusCodes.BAD_REQUEST });
  }

  if (clientSecret !== config.clientSecret) {
    return Response.json({ error: 'invalid_client' }, { status: HttpStatusCodes.BAD_REQUEST });
  }

  if (!code) {
    return Response.json({ error: 'invalid_code' }, { status: HttpStatusCodes.BAD_REQUEST });
  }

  if (grantType !== 'authorization_code') {
    return Response.json({ error: 'invalid_grant_type' }, { status: HttpStatusCodes.BAD_REQUEST });
  }

  if (redirectUri && !config.allowedRedirectUris.includes(redirectUri)) {
    return Response.json({ error: 'invalid_redirect_uri' }, { status: HttpStatusCodes.BAD_REQUEST });
  }

  //
  // first-level validation passed; fetch tokens from cache
  //

  const tokenSet = tokenCache.get(code);
  tokenCache.delete(code);

  if (!tokenSet) {
    return Response.json({ error: 'invalid_code' }, { status: HttpStatusCodes.BAD_REQUEST });
  }

  //
  // second-level validation passed; return tokens
  //

  return Response.json({
    access_token: tokenSet.accessToken,
    expires_in: 24 * 60 * 60,
    id_token: tokenSet.idToken,
    token_type: 'Bearer',
  });
}

/**
 * see: https://openid.net/specs/openid-connect-core-1_0.html#UserInfo
 */
function handleUserinfoRequest(): Response {
  return Response.json({
    sub: '00000000-0000-0000-0000-000000000000',
    name: 'Application Developer',
    given_name: 'Application',
    family_name: 'Developer',
    email: 'developer@example.com',
  });
}

/**
 * Get the OIDC configuration.
 */
function getConfig(currentUrl: URL): OidcConfig {
  return {
    issuer: new URL('/auth/oidc', currentUrl.origin).toString(),
    clientId: '00000000-0000-0000-0000-000000000000',
    clientSecret: '00000000-0000-0000-0000-000000000000',
    allowedRedirectUris: [new URL('/auth/callback/local', currentUrl.origin).toString()],
  };
}

/**
 * Generate a public/private keypair to use when signing tokens.
 *
 * Note that while this might look dangerous, this is only ever used in
 * devmode, so there is no security risk in exposing this to the public!
 */
async function getKeyPair(): Promise<KeyPair> {
  return {
    privateKey: await importPKCS8(
      '-----BEGIN PRIVATE KEY-----' +
        'MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC5+g//WB25LGwm' +
        '0MehIRTkfE7mrWmBheUP2mwpMn2BRe7pKtTqXBYkYImryhiOrQc46B0i1FXR2Jjo' +
        'K08Z50BxnwIHVMg8CoxbnKXufGes80yVI6D01mu/ksuYNhyK0ZWhuppadV35HjJq' +
        'FD1syP+mRy+7wBwTA6UTvk6blw5DKmvk970eOOKU9X0xbRYDnqCevAbQvcQbaidN' +
        'FkE2Ff1ZJoPDgd5tEsb0cHeFTKEmp9b0dh3XvTzsJr2JkGPttG9ZuTRAWa7R7aB5' +
        'TBJoedFCwUo1nLJSU9jCoM+pdlIjA1T8Xten7qkQiik9z4G5EUmZ5LktwH41gOGD' +
        'JE8YtwbZAgMBAAECggEAOT/71bh76el9X5OMqJLk+hM0PLmsTWV45qDwA9yZmwZ6' +
        'rcd0JLL1U/xt1PbRCXbFTuTRN0wTIRait3HBl3FDOtbeioA0ZZs/quH1iI0+YxTA' +
        'gfamUUiCgcZAK1qY/bjX7aHiay9PHuWHUnVplUfovviR/qN8YPQRyJqgWzAsgUsS' +
        'I3OpHCeArTeAQ2CCR9DNV7v5I9odKzXq4EWeT+lQsaHf6uiyUnWzsQxUKZOv+CKC' +
        'Lxtcdw8dy3fRlh1n9o0HJettISQ2wAJibHKFsFHCkvR+Kf0dY0ISVWpXEZofLzY/' +
        'QVGNz33nv6uxKEBBE0vcApZxU75+Vp1Rs73g4Yo48wKBgQDztdUmNGhpmiq+0NLv' +
        'dln4ffk2tGACKlFS8pJzAfYjIMvncUOdIZBxqfjZTBWZ7hLPIRc1hNoqYO/meuhq' +
        'zcsc6mmA1DMsmywUeaDJG4m9CZ8tc1wJ8eGVeAk90G3SBu6kYPmMWls2/YTUtFl1' +
        '/2pAvS6UUIVXxtfOh/d1J2Ey1wKBgQDDWuwLOCZ1Ey2ziTEU0H627ffWMpG7jhGW' +
        '08E1NwDWphVr8jPvjHCcVCSAJQ23t/N97gLlhtx9Ebz9kfCJLImQ7iIqLJ3+ChnJ' +
        '/O3LpZrXDt7oiuk66Gs8+OcP3AaEa3jiiDy+cE3Fo301RXKaVUZTX9L7Qo6p4rO0' +
        'KOGIU4YNzwKBgQDTDJpjlWr+WIW/7TNeME3FxcH1v8qM1XzLqkls0zwGO7aY3RtC' +
        'jfh6lklsVFk4jlU3jl58+Gm93WijXbi8FS9aAR4QdLNEY7SOnq3AutpTHGv+fjIs' +
        'Yo2KVQMbxs3z3hD3xQsWooDvZCiN0wjOCLxJCAu4YOq4kvf8YP7JM6sWzQKBgQCg' +
        'c9lUDbZoimwK/i+17Nlm3mWlJLvV1IZV327dimPB6X/GvZQyuKL1g5bHOafesdPo' +
        'JslyRCZtA1i63Fc4E8CZrT2abjMGKL2tzXRyw34+DRTA4vdVTvhlh/ogaJNhx/Pt' +
        '/AAIWq1GG1YHnxbV9Bxi9l2PycbreiwnWTyEgDWmuQKBgQDULwwU3qKaqWkmnOz+' +
        'I5a6p7Cz2W590XBGMDiua3cVt/hFVPCvEtOCmodz9u5ovW/VLR5Xusn+d+jVYFsb' +
        'qPBiwRvpExe8Ory1eXWum6phpMDS99XXmZL+z6lNlXd99Cx5iSRZRCxTSAenj69Z' +
        'pGRIElx2LpscoD+GnZeLdWp+wQ==' +
        '-----END PRIVATE KEY-----',
      'RS256',
    ),
    publicKey: await importSPKI(
      '-----BEGIN PUBLIC KEY-----' +
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAufoP/1gduSxsJtDHoSEU' +
        '5HxO5q1pgYXlD9psKTJ9gUXu6SrU6lwWJGCJq8oYjq0HOOgdItRV0diY6CtPGedA' +
        'cZ8CB1TIPAqMW5yl7nxnrPNMlSOg9NZrv5LLmDYcitGVobqaWnVd+R4yahQ9bMj/' +
        'pkcvu8AcEwOlE75Om5cOQypr5Pe9HjjilPV9MW0WA56gnrwG0L3EG2onTRZBNhX9' +
        'WSaDw4HebRLG9HB3hUyhJqfW9HYd17087Ca9iZBj7bRvWbk0QFmu0e2geUwSaHnR' +
        'QsFKNZyyUlPYwqDPqXZSIwNU/F7Xp+6pEIopPc+BuRFJmeS5LcB+NYDhgyRPGLcG' +
        '2QIDAQAB' +
        '-----END PUBLIC KEY-----',
      'RS256',
    ),
  };
}
