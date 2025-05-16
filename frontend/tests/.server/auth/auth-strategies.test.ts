import { decodeJwt } from 'jose';
import {
  allowInsecureRequests,
  calculatePKCECodeChallenge,
  ClientSecretPost,
  discoveryRequest,
  generateRandomCodeVerifier,
  generateRandomNonce,
  generateRandomState,
  processAuthorizationCodeResponse,
  processDiscoveryResponse,
  validateAuthResponse,
} from 'oauth4webapi';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import {
  AzureADAuthenticationStrategy,
  BaseAuthenticationStrategy,
  LocalAuthenticationStrategy,
} from '~/.server/auth/auth-strategies';
import { ErrorCodes } from '~/errors/error-codes';

vi.mock('jose');
vi.mock('oauth4webapi');

describe('auth-strategies', () => {
  beforeEach(() => {
    vi.mocked(discoveryRequest).mockResolvedValue(mock());

    vi.mocked(processDiscoveryResponse).mockResolvedValue({
      issuer: 'https://auth.example.com/issuer',
      authorization_endpoint: 'https://auth.example.com/authorize',
      jwks_uri: 'https://auth.example.com/jwks',
    });
  });

  describe('BaseAuthenticationStrategy', () => {
    class TestAuthStrategy extends BaseAuthenticationStrategy {
      constructor() {
        super(
          'test',
          new URL('https://auth.example.com/issuer'),
          { client_id: 'test_client_id' },
          ClientSecretPost('test_client_secret'),
        );
      }

      // expose protected authorizationServer (for testing)
      public getAuthorizationServer() {
        return this.authorizationServer;
      }
    }

    describe('constructor', () => {
      it('should initialize AuthorizationServer correctly', async () => {
        const authServer = await new TestAuthStrategy().getAuthorizationServer();

        expect(authServer).toEqual({
          issuer: 'https://auth.example.com/issuer',
          authorization_endpoint: 'https://auth.example.com/authorize',
          jwks_uri: 'https://auth.example.com/jwks',
        });
      });

      it('should reject if no authorization endpoint is found', async () => {
        vi.mocked(processDiscoveryResponse).mockResolvedValue({
          issuer: 'https://auth.example.com/issuer',
          jwks_uri: 'https://auth.example.com/jwks',
          authorization_endpoint: undefined,
        });

        await expect(async () => await new TestAuthStrategy().getAuthorizationServer()).rejects.contains({
          msg: 'Authorization endpoint not found in the discovery document',
          errorCode: ErrorCodes.DISCOVERY_ENDPOINT_MISSING,
        });
      });

      it('should reject if no jwks endpoint is found', async () => {
        vi.mocked(processDiscoveryResponse).mockResolvedValue({
          issuer: 'https://auth.example.com/issuer',
          authorization_endpoint: 'https.auth.example.com/auth',
          jwks_uri: undefined,
        });

        await expect(async () => await new TestAuthStrategy().getAuthorizationServer()).rejects.contains({
          msg: 'JWKs endpoint not found in the discovery document',
          errorCode: ErrorCodes.DISCOVERY_ENDPOINT_MISSING,
        });
      });
    });

    describe('exchangeAuthCode', () => {
      it('should exchange authorization code for tokens', async () => {
        vi.mocked(processAuthorizationCodeResponse).mockResolvedValue({
          access_token: 'test_access_token',
          token_type: 'bearer',
          id_token: 'test_id_token',
        });

        vi.mocked(decodeJwt).mockReturnValue({
          iss: 'https://auth.example.com/issuer',
          sub: 'test_subject',
          aud: 'test_client_id',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        });

        const strategy = new TestAuthStrategy();

        const callbackUrl = new URL('https://auth.example.com/callback');
        const tokenSet = await strategy.exchangeAuthCode(
          callbackUrl,
          new URLSearchParams({
            code: 'test_code',
            state: 'mock_state',
          }),
          'mock_nonce',
          'mock_state',
          'mock_code_verifier',
        );

        expect(tokenSet).toEqual({
          accessToken: 'test_access_token',
          accessTokenClaims: {
            iss: 'https://auth.example.com/issuer',
            sub: 'test_subject',
            aud: 'test_client_id',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
          },
          idToken: 'test_id_token',
          idTokenClaims: {
            iss: 'https://auth.example.com/issuer',
            sub: 'test_subject',
            aud: 'test_client_id',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
          },
        });
      });
    });

    describe('generateSigninRequest', () => {
      it('should generate signin request with default openid scope', async () => {
        vi.mocked(generateRandomCodeVerifier).mockReturnValue('mock_code_verifier');
        vi.mocked(generateRandomNonce).mockReturnValue('mock_nonce');
        vi.mocked(generateRandomState).mockReturnValue('mock_state');
        vi.mocked(calculatePKCECodeChallenge).mockResolvedValue('mock_code_challenge');

        const callbackUrl = new URL('https://auth.example.com/callback');
        const signinRequest = await new TestAuthStrategy().generateSigninRequest(callbackUrl);

        expect(signinRequest).toEqual({
          // prettier-ignore
          authorizationEndpointUrl:
          new URL('https://auth.example.com/authorize' +
            '?client_id=test_client_id' +
            '&code_challenge_method=S256' +
            '&code_challenge=mock_code_challenge' +
            '&nonce=mock_nonce' +
            '&redirect_uri=https%3A%2F%2Fauth.example.com%2Fcallback' +
            '&response_type=code' +
            '&scope=openid+profile+email' +
            '&state=mock_state'),
          codeVerifier: 'mock_code_verifier',
          nonce: 'mock_nonce',
          state: 'mock_state',
        });
      });
    });
  });

  describe('AzureADAuthenticationStrategy', () => {
    it('should construct a new AzureADAuthenticationStrategy with the correct constructor parameters', async () => {
      vi.mocked(processAuthorizationCodeResponse, { partial: true }).mockResolvedValue({
        access_token: 'access-token',
        id_token: 'id-token',
      });

      vi.mocked(validateAuthResponse).mockReturnThis();

      const authenticationStrategy = new AzureADAuthenticationStrategy(
        new URL('https://auth.example.com/issuer'),
        'client-id',
        'client-secret',
      );

      await authenticationStrategy.exchangeAuthCode(
        new URL('https://example.com/callback'),
        new URLSearchParams(),
        'nonce',
        'state',
        'verifier',
      );

      expect(authenticationStrategy.name).toEqual('azuread');

      expect(vi.mocked(discoveryRequest)).toHaveBeenCalledWith(new URL('https://auth.example.com/issuer'), {
        [allowInsecureRequests]: false,
      });

      expect(vi.mocked(validateAuthResponse)).toHaveBeenCalledWith(
        {
          authorization_endpoint: 'https://auth.example.com/authorize',
          issuer: 'https://auth.example.com/issuer',
          jwks_uri: 'https://auth.example.com/jwks',
        },
        { client_id: 'client-id' },
        new URLSearchParams(),
        'state',
      );
    });
  });

  describe('LocalAuthenticationStrategy', () => {
    it('should construct a new LocalAuthenticationStrategy with the correct constructor parameters', async () => {
      vi.mocked(processAuthorizationCodeResponse, { partial: true }).mockResolvedValue({
        access_token: 'access-token',
        id_token: 'id-token',
      });

      vi.mocked(validateAuthResponse).mockReturnThis();

      const authenticationStrategy = new LocalAuthenticationStrategy(
        new URL('https://auth.example.com/issuer'),
        'client-id',
        'client-secret',
      );

      await authenticationStrategy.exchangeAuthCode(
        new URL('https://example.com/callback'),
        new URLSearchParams(),
        'nonce',
        'state',
        'verifier',
      );

      expect(authenticationStrategy.name).toEqual('local');

      expect(vi.mocked(discoveryRequest)).toHaveBeenCalledWith(new URL('https://auth.example.com/issuer'), {
        [allowInsecureRequests]: true,
      });

      expect(vi.mocked(validateAuthResponse)).toHaveBeenCalledWith(
        {
          authorization_endpoint: 'https://auth.example.com/authorize',
          issuer: 'https://auth.example.com/issuer',
          jwks_uri: 'https://auth.example.com/jwks',
        },
        { client_id: 'client-id' },
        new URLSearchParams(),
        'state',
      );
    });
  });
});
