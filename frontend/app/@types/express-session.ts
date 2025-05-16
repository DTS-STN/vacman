import 'express-session';

import type { AccessTokenClaims, IDTokenClaims } from '~/.server/auth/auth-strategies';

declare module 'express-session' {
  interface SessionData {
    authState: {
      accessToken: string;
      accessTokenClaims: AccessTokenClaims;
      idToken: string;
      idTokenClaims: IDTokenClaims;
    };
    loginState: {
      codeVerifier: string;
      nonce: string;
      returnUrl?: URL;
      state: string;
    };
  }
}

export {};
