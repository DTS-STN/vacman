// Test to validate the authentication and registration flow
import { describe, it, expect } from 'vitest';

import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import { isRegistrationPath } from '~/.server/utils/user-registration-utils';

describe('Authentication and Registration Flow', () => {
  describe('isRegistrationPath', () => {
    it('should identify registration paths correctly', () => {
      expect(isRegistrationPath(new URL('http://localhost:3000/en/register'))).toBe(true);
      expect(isRegistrationPath(new URL('http://localhost:3000/en/register/privacy-consent'))).toBe(true);
      expect(isRegistrationPath(new URL('http://localhost:3000/fr/enregistrer'))).toBe(true);
      expect(isRegistrationPath(new URL('http://localhost:3000/fr/enregistrer/consentement-a-la-confidentialite'))).toBe(true);
      expect(isRegistrationPath(new URL('http://localhost:3000/en/dashboard'))).toBe(false);
      expect(isRegistrationPath(new URL('http://localhost:3000/en/'))).toBe(false);
    });
  });

  describe('User Registration Flow', () => {
    const userService = getMockUserService();

    it('should register a new hiring manager successfully', async () => {
      const newUserData = {
        name: 'Test Hiring Manager',
        activeDirectoryId: 'test-ad-id-123',
      };

      const registeredUser = await userService.registerUser(newUserData);

      expect(registeredUser).toMatchObject({
        name: 'Test Hiring Manager',
        activeDirectoryId: 'test-ad-id-123',
      });
      expect(registeredUser.id).toBeDefined();
      expect(registeredUser.createdBy).toBe('system');
      expect(registeredUser.createdDate).toBeDefined();
    });

    it('should find user by activeDirectoryId after registration', async () => {
      const newUserData = {
        name: 'Test User for Lookup',
        activeDirectoryId: 'test-ad-lookup-456',
      };

      // Register the user
      await userService.registerUser(newUserData);

      // Try to find them by Active Directory ID
      const foundUser = await userService.getUserByActiveDirectoryId('test-ad-lookup-456');

      expect(foundUser).toBeTruthy();
      expect(foundUser?.name).toBe('Test User for Lookup');
      expect(foundUser?.activeDirectoryId).toBe('test-ad-lookup-456');
    });

    it('should return null for non-existent activeDirectoryId', async () => {
      const nonExistentUser = await userService.getUserByActiveDirectoryId('non-existent-id');
      expect(nonExistentUser).toBeNull();
    });
  });

  describe('Complete Registration Flow Simulation', () => {
    it('should simulate complete flow for new user', async () => {
      const mockActiveDirectoryId = 'new-user-789';
      const userService = getMockUserService();

      // Step 1: Check if user exists (should be null for new user)
      const existingUser = await userService.getUserByActiveDirectoryId(mockActiveDirectoryId);
      expect(existingUser).toBeNull();

      // Step 2: Register the user
      const registrationData = {
        name: 'New Hiring Manager',
        activeDirectoryId: mockActiveDirectoryId,
      };

      const newUser = await userService.registerUser(registrationData);
      expect(newUser).toBeTruthy();
      expect(newUser.activeDirectoryId).toBe(mockActiveDirectoryId);

      // Step 3: Verify user can now be found
      const foundUser = await userService.getUserByActiveDirectoryId(mockActiveDirectoryId);
      expect(foundUser).toBeTruthy();
      expect(foundUser?.id).toBe(newUser.id);
    });
  });
});
