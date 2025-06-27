import { describe, expect, it, vi, beforeEach } from 'vitest';

import { getUserService } from '~/.server/domain/services/user-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { requireHiringManagerRegistration, isHiringManagerPath } from '~/.server/utils/hiring-manager-registration-utils';

// Mock the getUserService
vi.mock('~/.server/domain/services/user-service', () => ({
  getUserService: vi.fn(),
}));

// Mock the i18nRedirect function
vi.mock('~/.server/utils/route-utils', () => ({
  i18nRedirect: vi.fn((routeId: string, currentUrl: URL) => {
    // Create a mock redirect response
    const response = new Response(null, {
      status: 302,
      headers: { Location: currentUrl.pathname.startsWith('/fr') ? '/fr/' : '/en/' },
    });
    throw response;
  }),
}));

const mockUserService = {
  getUsersByRole: vi.fn(),
  getUserByActiveDirectoryId: vi.fn(),
  registerUser: vi.fn(),
  updateUserRole: vi.fn(),
  getUserById: vi.fn(),
  updatePrivacyConsent: vi.fn(),
};

vi.mocked(getUserService).mockReturnValue(mockUserService);

describe('Hiring Manager Registration Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireHiringManagerRegistration', () => {
    const createMockSession = (sub: string, oid: string = sub): AuthenticatedSession =>
      ({
        authState: {
          accessTokenClaims: {
            roles: [],
            sub,
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub,
            oid,
            name: 'Test User',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      }) as unknown as AuthenticatedSession;

    it('should allow access for registered hiring managers', async () => {
      // Arrange
      const mockSession = createMockSession('test-hiring-manager-123');
      const currentUrl = new URL('http://localhost:3000/en/hiring-manager');

      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 1,
        name: 'Test Hiring Manager',
        activeDirectoryId: 'test-hiring-manager-123',
        role: 'hiring-manager',
        createdBy: 'system',
        createdDate: '2024-01-01T00:00:00Z',
        lastModifiedBy: 'system',
        lastModifiedDate: '2024-01-01T00:00:00Z',
      });

      // Act & Assert - should not throw
      await expect(requireHiringManagerRegistration(mockSession, currentUrl)).resolves.not.toThrow();

      expect(mockUserService.getUserByActiveDirectoryId).toHaveBeenCalledWith('test-hiring-manager-123');
    });

    it('should redirect when user is not found in database', async () => {
      // Arrange
      const mockSession = createMockSession('test-unregistered-user');
      const currentUrl = new URL('http://localhost:3000/en/hiring-manager');

      mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null);

      // Act & Assert - should throw redirect
      await expect(requireHiringManagerRegistration(mockSession, currentUrl)).rejects.toThrow();

      expect(mockUserService.getUserByActiveDirectoryId).toHaveBeenCalledWith('test-unregistered-user');
    });

    it('should redirect when user is not a hiring manager', async () => {
      // Arrange
      const mockSession = createMockSession('test-employee-123');
      const currentUrl = new URL('http://localhost:3000/en/hiring-manager');

      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 1,
        name: 'Test Employee',
        activeDirectoryId: 'test-employee-123',
        role: 'employee',
        privacyConsentAccepted: true,
        createdBy: 'system',
        createdDate: '2024-01-01T00:00:00Z',
        lastModifiedBy: 'system',
        lastModifiedDate: '2024-01-01T00:00:00Z',
      });

      // Act & Assert - should throw redirect
      await expect(requireHiringManagerRegistration(mockSession, currentUrl)).rejects.toThrow();

      expect(mockUserService.getUserByActiveDirectoryId).toHaveBeenCalledWith('test-employee-123');
    });

    it('should redirect when user has hr-advisor role instead of hiring-manager', async () => {
      // Arrange
      const mockSession = createMockSession('test-hr-advisor-123');
      const currentUrl = new URL('http://localhost:3000/en/hiring-manager');

      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 1,
        name: 'Test HR Advisor',
        activeDirectoryId: 'test-hr-advisor-123',
        role: 'hr-advisor',
        createdBy: 'system',
        createdDate: '2024-01-01T00:00:00Z',
        lastModifiedBy: 'system',
        lastModifiedDate: '2024-01-01T00:00:00Z',
      });

      // Act & Assert - should throw redirect
      await expect(requireHiringManagerRegistration(mockSession, currentUrl)).rejects.toThrow();

      expect(mockUserService.getUserByActiveDirectoryId).toHaveBeenCalledWith('test-hr-advisor-123');
    });

    it('should work with French locale URLs', async () => {
      // Arrange
      const mockSession = createMockSession('test-hiring-manager-fr');
      const currentUrl = new URL('http://localhost:3000/fr/gestionnaire-embauche');

      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 1,
        name: 'Gestionnaire Test',
        activeDirectoryId: 'test-hiring-manager-fr',
        role: 'hiring-manager',
        createdBy: 'system',
        createdDate: '2024-01-01T00:00:00Z',
        lastModifiedBy: 'system',
        lastModifiedDate: '2024-01-01T00:00:00Z',
      });

      // Act & Assert - should not throw
      await expect(requireHiringManagerRegistration(mockSession, currentUrl)).resolves.not.toThrow();

      expect(mockUserService.getUserByActiveDirectoryId).toHaveBeenCalledWith('test-hiring-manager-fr');
    });
  });

  describe('isHiringManagerPath', () => {
    it('should return true for English hiring manager paths', () => {
      const url = new URL('http://localhost:3000/en/hiring-manager');
      expect(isHiringManagerPath(url)).toBe(true);
    });

    it('should return true for French hiring manager paths', () => {
      const url = new URL('http://localhost:3000/fr/gestionnaire-embauche');
      expect(isHiringManagerPath(url)).toBe(true);
    });

    it('should return true for nested hiring manager paths', () => {
      const englishUrl = new URL('http://localhost:3000/en/hiring-manager/dashboard');
      const frenchUrl = new URL('http://localhost:3000/fr/gestionnaire-embauche/tableau-de-bord');

      expect(isHiringManagerPath(englishUrl)).toBe(true);
      expect(isHiringManagerPath(frenchUrl)).toBe(true);
    });

    it('should return false for non-hiring manager paths', () => {
      const employeeUrl = new URL('http://localhost:3000/en/employee');
      const rootUrl = new URL('http://localhost:3000/en/');
      const profileUrl = new URL('http://localhost:3000/en/employee/profile');

      expect(isHiringManagerPath(employeeUrl)).toBe(false);
      expect(isHiringManagerPath(rootUrl)).toBe(false);
      expect(isHiringManagerPath(profileUrl)).toBe(false);
    });

    it('should return false for similar but incorrect paths', () => {
      const incorrectUrl = new URL('http://localhost:3000/en/hiring-managers'); // plural
      const partialUrl = new URL('http://localhost:3000/en/hiring');

      expect(isHiringManagerPath(incorrectUrl)).toBe(false);
      expect(isHiringManagerPath(partialUrl)).toBe(false);
    });
  });
});
