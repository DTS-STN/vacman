/**
 * Tests for profile access control utilities.
 * This module tests the functions that verify if users have access to view or modify profiles
 * based on their role and relationship to the profile owner.
 */
import { None, Some } from 'oxide.ts';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import {
  requireProfileAccess,
  hasProfileAccess,
  getProfileWithAccess,
  checkProfileRouteAccess,
} from '~/.server/utils/profile-access-utils';
import { extractUserIdFromProfileRoute, isProfileRoute } from '~/.server/utils/route-matching-utils';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Mock the services
vi.mock('~/.server/domain/services/profile-service');
vi.mock('~/.server/domain/services/user-service');
vi.mock('~/.server/utils/privacy-consent-utils');
vi.mock('~/.server/utils/route-matching-utils');

const mockProfileService = {
  getProfile: vi.fn(),
  getProfileById: vi.fn(),
  registerProfile: vi.fn(),
  updateProfile: vi.fn(),
  submitProfileForReview: vi.fn(),
  getAllProfiles: vi.fn(),
};
const mockUserService = {
  getUserByActiveDirectoryId: vi.fn(),
  updateUserRole: vi.fn(),
  getUsersByRole: vi.fn(),
  getUserById: vi.fn(),
  getCurrentUser: vi.fn(),
  registerCurrentUser: vi.fn(),
};
const mockRequirePrivacyConsentForOwnProfile = vi.fn();
const mockExtractUserIdFromProfileRoute = vi.fn();
const mockIsProfileRoute = vi.fn();

vi.mocked(getProfileService).mockReturnValue(mockProfileService);
vi.mocked(getUserService).mockReturnValue(mockUserService);
vi.mocked(requirePrivacyConsentForOwnProfile).mockImplementation(mockRequirePrivacyConsentForOwnProfile);
vi.mocked(extractUserIdFromProfileRoute).mockImplementation(mockExtractUserIdFromProfileRoute);
vi.mocked(isProfileRoute).mockImplementation(mockIsProfileRoute);

// Helper to create mock session
function createMockSession(requesterId: string, name = 'Test User'): AuthenticatedSession {
  return {
    authState: {
      accessTokenClaims: {
        roles: [],
        sub: requesterId,
        aud: 'test-audience',
        client_id: 'test-client',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        iss: 'test-issuer',
        jti: 'test-jti',
      },
      idTokenClaims: {
        sub: requesterId,
        oid: requesterId,
        name,
        aud: 'test-audience',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        iss: 'test-issuer',
      },
      accessToken: 'mock-access-token',
      idToken: 'mock-id-token',
    },
  } as unknown as AuthenticatedSession;
}

// Mock profile data
const mockProfile = {
  profileId: 1,
  userId: 1,
  profileStatusId: 1,
  privacyConsentInd: true,
  userCreated: 'test-user-123',
  dateCreated: '2024-01-01T00:00:00Z',
  personalInformation: {
    personalRecordIdentifier: '123456789',
    surname: 'Doe',
    givenName: 'John',
    dateOfBirth: '1990-01-01',
    preferredLanguage: 'en',
  },
  referralPreferences: {
    availableForReferralInd: true,
    interestedInAlternationInd: false,
    employmentTenureIds: ['664190000'],
  },
};

// Mock user data
const mockEmployee = {
  id: 1,
  uuName: 'Test Employee',
  networkName: 'test-employee-123',
  activeDirectoryId: 'test-employee-123',
  role: 'employee',
  userCreated: 'system',
  dateCreated: '2024-01-01T00:00:00Z',
};

const mockHiringManager = {
  id: 2,
  uuName: 'Test Hiring Manager',
  networkName: 'test-manager-456',
  activeDirectoryId: 'test-manager-456',
  role: 'hiring-manager',
  userCreated: 'system',
  dateCreated: '2024-01-01T00:00:00Z',
};

describe('Profile Access Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: profile exists
    mockProfileService.getProfile.mockResolvedValue(Some(mockProfile));
    // Default: no privacy consent check required
    mockRequirePrivacyConsentForOwnProfile.mockResolvedValue(undefined);
  });

  describe('requireProfileAccess', () => {
    describe('profile existence check', () => {
      it('should throw error when profile does not exist', async () => {
        // Arrange
        const session = createMockSession('test-user-123');
        const targetUserId = 'non-existent-user';
        mockProfileService.getProfile.mockResolvedValue(None);

        // Act & Assert
        await expect(requireProfileAccess(session, targetUserId)).rejects.toThrow(AppError);
        await expect(requireProfileAccess(session, targetUserId)).rejects.toMatchObject({
          errorCode: ErrorCodes.PROFILE_NOT_FOUND,
          httpStatusCode: HttpStatusCodes.NOT_FOUND,
        });
      });
    });

    describe('own profile access', () => {
      it('should grant access when user accesses their own profile', async () => {
        // Arrange
        const session = createMockSession('test-user-123');
        const targetUserId = 'test-user-123';
        const currentUrl = new URL('http://localhost:3000/en/employee/test-user-123/profile');

        // Act & Assert - should not throw
        await expect(requireProfileAccess(session, targetUserId, currentUrl)).resolves.not.toThrow();
        expect(mockRequirePrivacyConsentForOwnProfile).toHaveBeenCalledWith(session, targetUserId, currentUrl);
      });

      it('should grant access when user accesses their own profile without URL', async () => {
        // Arrange
        const session = createMockSession('test-user-123');
        const targetUserId = 'test-user-123';

        // Act & Assert - should not throw
        await expect(requireProfileAccess(session, targetUserId)).resolves.not.toThrow();
        expect(mockRequirePrivacyConsentForOwnProfile).not.toHaveBeenCalled();
      });

      it('should propagate privacy consent redirect errors', async () => {
        // Arrange
        const session = createMockSession('test-user-123');
        const targetUserId = 'test-user-123';
        const currentUrl = new URL('http://localhost:3000/en/employee/test-user-123/profile');
        const redirectError = new Response(null, { status: 302, headers: { Location: '/privacy-consent' } });
        mockRequirePrivacyConsentForOwnProfile.mockRejectedValue(redirectError);

        // Act & Assert
        await expect(requireProfileAccess(session, targetUserId, currentUrl)).rejects.toBe(redirectError);
      });
    });

    describe('hiring manager access', () => {
      it('should grant access when hiring manager accesses other profiles', async () => {
        // Arrange
        const session = createMockSession('test-manager-456');
        const targetUserId = 'test-employee-123';
        mockUserService.getUserByActiveDirectoryId.mockResolvedValue(mockHiringManager);

        // Act & Assert - should not throw
        await expect(requireProfileAccess(session, targetUserId)).resolves.not.toThrow();
        expect(mockUserService.getUserByActiveDirectoryId).toHaveBeenCalledWith('test-manager-456');
      });

      it('should throw error when requester is not found in system', async () => {
        // Arrange
        const session = createMockSession('test-unknown-user');
        const targetUserId = 'test-employee-123';
        mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null);

        // Act & Assert
        await expect(requireProfileAccess(session, targetUserId)).rejects.toThrow(AppError);
        await expect(requireProfileAccess(session, targetUserId)).rejects.toMatchObject({
          errorCode: ErrorCodes.ACCESS_FORBIDDEN,
          httpStatusCode: HttpStatusCodes.FORBIDDEN,
        });
      });
    });

    describe('access denial', () => {
      it('should deny access when employee tries to access another employee profile', async () => {
        // Arrange
        const session = createMockSession('test-employee-456');
        const targetUserId = 'test-employee-123';
        mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
          ...mockEmployee,
          activeDirectoryId: 'test-employee-456',
        });

        // Act & Assert
        await expect(requireProfileAccess(session, targetUserId)).rejects.toThrow(AppError);
        await expect(requireProfileAccess(session, targetUserId)).rejects.toMatchObject({
          errorCode: ErrorCodes.ACCESS_FORBIDDEN,
          httpStatusCode: HttpStatusCodes.FORBIDDEN,
        });
      });

      it('should not deny access when HR advisor tries to access profiles', async () => {
        // Arrange
        const session = createMockSession('test-hr-advisor');
        const targetUserId = 'test-employee-123';
        mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
          ...mockEmployee,
          activeDirectoryId: 'test-hr-advisor',
          role: 'hr-advisor',
        });

        // Act & Assert
        await expect(requireProfileAccess(session, targetUserId)).resolves.not.toThrow();
        expect(mockUserService.getUserByActiveDirectoryId).toHaveBeenCalledWith('test-hr-advisor');
      });
    });
  });

  describe('hasProfileAccess', () => {
    it('should return true when access is granted', async () => {
      // Arrange
      const session = createMockSession('test-user-123');
      const targetUserId = 'test-user-123';

      // Act
      const result = await hasProfileAccess(session, targetUserId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when access is denied', async () => {
      // Arrange
      const session = createMockSession('test-employee-456');
      const targetUserId = 'test-employee-123';
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        ...mockEmployee,
        activeDirectoryId: 'test-employee-456',
      });

      // Act
      const result = await hasProfileAccess(session, targetUserId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when profile does not exist', async () => {
      // Arrange
      const session = createMockSession('test-user-123');
      const targetUserId = 'non-existent-user';
      mockProfileService.getProfile.mockResolvedValue(None);

      // Act
      const result = await hasProfileAccess(session, targetUserId);

      // Assert
      expect(result).toBe(false);
    });

    it('should re-throw unexpected errors', async () => {
      // Arrange
      const session = createMockSession('test-user-123');
      const targetUserId = 'test-user-123';
      const unexpectedError = new Error('Unexpected error');
      mockProfileService.getProfile.mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(hasProfileAccess(session, targetUserId)).rejects.toThrow(unexpectedError);
    });
  });

  describe('getProfileWithAccess', () => {
    it('should return profile when access is granted', async () => {
      // Arrange
      const session = createMockSession('test-user-123');
      const targetUserId = 'test-user-123';

      // Act
      const result = await getProfileWithAccess(session, targetUserId);

      // Assert
      expect(result).toEqual(mockProfile);
    });

    it('should throw error when access is denied', async () => {
      // Arrange
      const session = createMockSession('test-employee-456');
      const targetUserId = 'test-employee-123';
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        ...mockEmployee,
        activeDirectoryId: 'test-employee-456',
      });

      // Act & Assert
      await expect(getProfileWithAccess(session, targetUserId)).rejects.toThrow(AppError);
    });

    it('should handle edge case where profile disappears after access check', async () => {
      // Arrange
      const session = createMockSession('test-user-123');
      const targetUserId = 'test-user-123';

      // Mock profile exists for access check but not for retrieval
      let callCount = 0;
      mockProfileService.getProfile.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(Some(mockProfile)); // First call in requireProfileAccess
        } else {
          return Promise.resolve(None); // Second call in getProfileWithAccess
        }
      });

      // Act & Assert
      await expect(getProfileWithAccess(session, targetUserId)).rejects.toThrow(AppError);
      await expect(getProfileWithAccess(session, targetUserId)).rejects.toMatchObject({
        errorCode: ErrorCodes.PROFILE_NOT_FOUND,
        httpStatusCode: HttpStatusCodes.NOT_FOUND,
      });
    });
  });

  describe('checkProfileRouteAccess', () => {
    it('should skip access check for non-profile routes', async () => {
      // Arrange
      const session = createMockSession('test-user-123');
      const currentUrl = new URL('http://localhost:3000/en/employee');
      mockIsProfileRoute.mockReturnValue(false);

      // Act & Assert - should not throw
      await expect(checkProfileRouteAccess(session, currentUrl)).resolves.not.toThrow();
      expect(mockExtractUserIdFromProfileRoute).not.toHaveBeenCalled();
    });

    it('should perform access check for profile routes', async () => {
      // Arrange
      const session = createMockSession('test-user-123');
      const currentUrl = new URL('http://localhost:3000/en/employee/test-user-123/profile');
      mockIsProfileRoute.mockReturnValue(true);
      mockExtractUserIdFromProfileRoute.mockReturnValue(Some('test-user-123'));

      // Act & Assert - should not throw
      await expect(checkProfileRouteAccess(session, currentUrl)).resolves.not.toThrow();
      expect(mockIsProfileRoute).toHaveBeenCalledWith(currentUrl);
      expect(mockExtractUserIdFromProfileRoute).toHaveBeenCalledWith(currentUrl);
    });

    it('should throw error when profile route has no user ID', async () => {
      // Arrange
      const session = createMockSession('test-user-123');
      const currentUrl = new URL('http://localhost:3000/en/employee/profile');
      mockIsProfileRoute.mockReturnValue(true);
      mockExtractUserIdFromProfileRoute.mockReturnValue(None);

      // Act & Assert
      await expect(checkProfileRouteAccess(session, currentUrl)).rejects.toThrow(AppError);
      await expect(checkProfileRouteAccess(session, currentUrl)).rejects.toMatchObject({
        errorCode: ErrorCodes.ROUTE_NOT_FOUND,
        httpStatusCode: HttpStatusCodes.BAD_REQUEST,
      });
    });

    it('should propagate access denied errors', async () => {
      // Arrange
      const session = createMockSession('test-employee-456');
      const currentUrl = new URL('http://localhost:3000/en/employee/test-employee-123/profile');
      mockIsProfileRoute.mockReturnValue(true);
      mockExtractUserIdFromProfileRoute.mockReturnValue(Some('test-employee-123'));
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        ...mockEmployee,
        activeDirectoryId: 'test-employee-456',
      });

      // Act & Assert
      await expect(checkProfileRouteAccess(session, currentUrl)).rejects.toThrow(AppError);
      await expect(checkProfileRouteAccess(session, currentUrl)).rejects.toMatchObject({
        errorCode: ErrorCodes.ACCESS_FORBIDDEN,
        httpStatusCode: HttpStatusCodes.FORBIDDEN,
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete hiring manager access flow', async () => {
      // Arrange
      const session = createMockSession('test-manager-456');
      const targetUserId = 'test-employee-123';
      const currentUrl = new URL('http://localhost:3000/en/employee/test-employee-123/profile');
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue(mockHiringManager);

      // Act
      const hasAccess = await hasProfileAccess(session, targetUserId, currentUrl);
      const profile = await getProfileWithAccess(session, targetUserId, currentUrl);

      // Assert
      expect(hasAccess).toBe(true);
      expect(profile).toEqual(mockProfile);
      expect(mockUserService.getUserByActiveDirectoryId).toHaveBeenCalledWith('test-manager-456');
    });

    it('should handle complete employee self-access flow', async () => {
      // Arrange
      const session = createMockSession('test-employee-123');
      const targetUserId = 'test-employee-123';
      const currentUrl = new URL('http://localhost:3000/en/employee/test-employee-123/profile');

      // Act
      const hasAccess = await hasProfileAccess(session, targetUserId, currentUrl);
      const profile = await getProfileWithAccess(session, targetUserId, currentUrl);

      // Assert
      expect(hasAccess).toBe(true);
      expect(profile).toEqual(mockProfile);
      expect(mockRequirePrivacyConsentForOwnProfile).toHaveBeenCalledWith(session, targetUserId, currentUrl);
      // User service should not be called for own profile access
      expect(mockUserService.getUserByActiveDirectoryId).not.toHaveBeenCalled();
    });

    it('should handle profile route access check integration', async () => {
      // Arrange
      const session = createMockSession('test-user-123');
      const currentUrl = new URL('http://localhost:3000/en/employee/test-user-123/profile');
      mockIsProfileRoute.mockReturnValue(true);
      mockExtractUserIdFromProfileRoute.mockReturnValue(Some('test-user-123'));

      // Act & Assert - should not throw
      await expect(checkProfileRouteAccess(session, currentUrl)).resolves.not.toThrow();
      expect(mockIsProfileRoute).toHaveBeenCalledWith(currentUrl);
      expect(mockExtractUserIdFromProfileRoute).toHaveBeenCalledWith(currentUrl);
      expect(mockRequirePrivacyConsentForOwnProfile).toHaveBeenCalledWith(session, 'test-user-123', currentUrl);
    });
  });
});
