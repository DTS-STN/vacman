import { LogFactory } from '~/.server/logging';

const log = LogFactory.getLogger(import.meta.url);

export interface JWTClaims {
  roles?: string[];
  sub?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Decodes a JWT token and returns the payload claims
 * @param token - The JWT token to decode
 * @returns The decoded claims or null if decoding fails
 */
export function decodeJWTClaims(token: string): JWTClaims | null {
  try {
    // Split the token into header, payload, and signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      log.warn('Invalid JWT token format');
      return null;
    }

    // Decode the payload (second part)
    const base64Url = parts[1];
    if (!base64Url) {
      log.warn('Invalid JWT token: missing payload');
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    const padding = base64.length % 4;
    const paddedBase64 = padding ? base64 + '='.repeat(4 - padding) : base64;

    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload) as JWTClaims;
  } catch (error) {
    log.error('Failed to decode JWT token', error);
    return null;
  }
}

/**
 * Extracts roles from JWT token claims
 * @param token - The JWT token to extract roles from
 * @returns Array of roles or empty array if none found
 */
export function getRolesFromJWT(token: string): string[] {
  const claims = decodeJWTClaims(token);
  return claims?.roles ?? [];
}
