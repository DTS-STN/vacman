/**
 * Type declarations for extending the express-session module.
 *
 * This file augments the express-session types to include custom session data
 * properties used for OAuth/OpenID Connect authentication in the application.
 * The extensions support storing authentication state and login flow parameters
 * during the OAuth authorization code grant flow.
 */
import 'express-session';

import type { AccessTokenClaims, IDTokenClaims } from '~/.server/auth/auth-strategies';

declare module 'express-session' {
  interface SessionData {
    /**
     * Stores the authenticated user's OAuth tokens and decoded claims.
     * This data is populated after successful authentication and contains
     * the access token, ID token, and their respective decoded JWT claims.
     */
    authState: {
      accessToken: string;
      accessTokenClaims: AccessTokenClaims;
      idToken: string;
      idTokenClaims: IDTokenClaims;
    };
    /**
     * Stores OAuth login flow parameters used during the authorization code grant.
     * These values are generated before redirecting to the authorization server
     * and are used to validate the callback response and prevent CSRF attacks.
     */
    loginState: {
      codeVerifier: string;
      nonce: string;
      returnUrl?: URL;
      state: string;
    };
  }
}

// Required empty export to ensure this file is treated as a module by TypeScript,
// allowing the module augmentation above to be properly scoped and applied.
export {};
