/**
 * Tests for authentication utilities.
 */
import { redirect } from 'react-router';

import { describe, it, expect, vi } from 'vitest';

import { requireAuthentication, requireAllRoles, requireAnyRole } from '~/.server/utils/auth-utils';

// Mock the redirect function
vi.mock('react-router', () => ({
  redirect: vi.fn(),
}));

describe('auth-utils', () => {
  describe('requireAuthentication', () => {
    it('should throw redirect when session has no authState', () => {
      const session: AppSession = {} as AppSession;
      const request = new Request('https://example.com/test?param=value');

      expect(() => requireAuthentication(session, request)).toThrow();
      expect(vi.mocked(redirect)).toHaveBeenCalledWith('/auth/login?returnto=%2Ftest%3Fparam%3Dvalue');
    });

    it('should throw redirect when JWT has expired', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiredTime = currentTime - 3600; // 1 hour ago

      const session: AppSession = {
        authState: {
          accessToken: 'test-token',
          accessTokenClaims: {
            exp: expiredTime,
            aud: 'test-client',
            iss: 'test-issuer',
            sub: 'test-user',
            iat: expiredTime - 3600,
            oid: 'test-oid',
          },
          idToken: 'test-id-token',
          idTokenClaims: {
            exp: expiredTime,
            aud: 'test-client',
            iss: 'test-issuer',
            sub: 'test-user',
            iat: expiredTime - 3600,
            oid: 'test-oid',
          },
        },
      } as AppSession;

      const request = new Request('https://example.com/protected');

      expect(() => requireAuthentication(session, request)).toThrow();
      expect(vi.mocked(redirect)).toHaveBeenCalledWith('/auth/login?returnto=%2Fprotected');

      // Should clear the expired auth state
      expect(session.authState).toBeUndefined();
    });

    it('should pass when JWT is valid and not expired', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const futureTime = currentTime + 3600; // 1 hour from now

      const session: AppSession = {
        authState: {
          accessToken: 'test-token',
          accessTokenClaims: {
            exp: futureTime,
            aud: 'test-client',
            iss: 'test-issuer',
            sub: 'test-user',
            iat: currentTime,
            oid: 'test-oid',
          },
          idToken: 'test-id-token',
          idTokenClaims: {
            exp: futureTime,
            aud: 'test-client',
            iss: 'test-issuer',
            sub: 'test-user',
            iat: currentTime,
            oid: 'test-oid',
          },
        },
      } as AppSession;

      const request = new Request('https://example.com/protected');

      // Should not throw
      expect(() => requireAuthentication(session, request)).not.toThrow();

      // Should not clear the auth state
      expect(session.authState).toBeDefined();
    });

    it('should handle missing exp claim gracefully', () => {
      const currentTime = Math.floor(Date.now() / 1000);

      const session: AppSession = {
        authState: {
          accessToken: 'test-token',
          accessTokenClaims: {
            // No exp claim
            aud: 'test-client',
            iss: 'test-issuer',
            sub: 'test-user',
            iat: currentTime,
            oid: 'test-oid',
          },
          idToken: 'test-id-token',
          idTokenClaims: {
            aud: 'test-client',
            iss: 'test-issuer',
            sub: 'test-user',
            iat: currentTime,
            oid: 'test-oid',
          },
        },
      } as AppSession;

      const request = new Request('https://example.com/protected');

      // Should not throw when exp claim is missing
      expect(() => requireAuthentication(session, request)).not.toThrow();
    });
  });

  describe('requireAllRoles', () => {
    it('should call requireAuthentication first', () => {
      const session: AppSession = {} as AppSession;
      const url = new URL('https://example.com/test');

      expect(() => requireAllRoles(session, url, ['admin'])).toThrow();
      expect(vi.mocked(redirect)).toHaveBeenCalled();
    });
  });

  describe('requireAnyRole', () => {
    it('should call requireAuthentication first', () => {
      const session: AppSession = {} as AppSession;
      const url = new URL('https://example.com/test');

      expect(() => requireAnyRole(session, url, ['admin'])).toThrow();
      expect(vi.mocked(redirect)).toHaveBeenCalled();
    });
  });
});
