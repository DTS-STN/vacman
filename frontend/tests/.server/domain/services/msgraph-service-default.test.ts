import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getDefaultMSGraphService } from '~/.server/domain/services/msgraph-service-default';
import { serverEnvironment } from '~/.server/environment';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Mock the server environment
vi.mock('~/.server/environment', () => ({
  serverEnvironment: {
    AZUREAD_CLIENT_ID: 'test-client-id',
    AZUREAD_CLIENT_SECRET: {
      value: () => 'test-client-secret',
    },
    AZUREAD_TENANT_ID: 'test-tenant-id',
    MSGRAPH_BASE_URL: 'https://graph.microsoft.com/v1.0',
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('getDefaultMSGraphService', () => {
  const service = getDefaultMSGraphService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getUserFromMSGraph', () => {
    it('should successfully retrieve user data from Microsoft Graph API', async () => {
      const mockTokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'mock-access-token',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
      };

      const mockUserResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          id: 'test-user-id',
          displayName: 'John Doe',
          givenName: 'John',
          surname: 'Doe',
          mail: 'john.doe@contoso.com',
          userPrincipalName: 'john.doe@contoso.com',
          jobTitle: 'Software Engineer',
          department: 'Engineering',
          officeLocation: 'Seattle',
          businessPhones: ['+1 425 555 0100'],
          mobilePhone: '+1 425 555 0101',
        }),
      };

      (global.fetch as any).mockResolvedValueOnce(mockTokenResponse).mockResolvedValueOnce(mockUserResponse);

      const result = await service.getUserFromMSGraph('test-user-id');

      expect(result).toEqual({
        id: 'test-user-id',
        displayName: 'John Doe',
        givenName: 'John',
        surname: 'Doe',
        mail: 'john.doe@contoso.com',
        userPrincipalName: 'john.doe@contoso.com',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        officeLocation: 'Seattle',
        businessPhones: ['+1 425 555 0100'],
        mobilePhone: '+1 425 555 0101',
      });

      // Verify token request
      expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://login.microsoftonline.com/test-tenant-id/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: 'test-client-id',
          client_secret: 'test-client-secret',
          scope: 'https://graph.microsoft.com/.default',
        }),
      });

      // Verify user request
      expect(global.fetch).toHaveBeenNthCalledWith(2, 'https://graph.microsoft.com/v1.0/users/test-user-id', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer mock-access-token',
          'Content-Type': 'application/json',
          'ConsistencyLevel': 'eventual',
        },
      });
    });

    it('should return null when user is not found (404)', async () => {
      const mockTokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'mock-access-token',
        }),
      };

      const mockUserResponse = {
        ok: false,
        status: HttpStatusCodes.NOT_FOUND,
      };

      (global.fetch as any).mockResolvedValueOnce(mockTokenResponse).mockResolvedValueOnce(mockUserResponse);

      const result = await service.getUserFromMSGraph('nonexistent-user-id');

      expect(result).toBeNull();
    });

    it('should handle missing optional fields in MS Graph response', async () => {
      const mockTokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'mock-access-token',
        }),
      };

      const mockUserResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          id: 'test-user-id',
          displayName: 'Minimal User',
          // Missing optional fields like givenName, surname, etc.
        }),
      };

      (global.fetch as any).mockResolvedValueOnce(mockTokenResponse).mockResolvedValueOnce(mockUserResponse);

      const result = await service.getUserFromMSGraph('test-user-id');

      expect(result).toEqual({
        id: 'test-user-id',
        displayName: 'Minimal User',
        givenName: undefined,
        surname: undefined,
        mail: undefined,
        userPrincipalName: '',
        jobTitle: undefined,
        department: undefined,
        officeLocation: undefined,
        businessPhones: [],
        mobilePhone: undefined,
      });
    });

    it('should throw authentication error when client credentials are missing', async () => {
      // Mock environment without client credentials
      vi.mocked(serverEnvironment).AZUREAD_CLIENT_ID = undefined;

      await expect(service.getUserFromMSGraph('test-user-id')).rejects.toMatchObject({
        msg: 'Azure AD client credentials are not configured. Please set AZUREAD_CLIENT_ID and AZUREAD_CLIENT_SECRET environment variables.',
        errorCode: ErrorCodes.AUTHENTICATION_ERROR,
      });

      // Restore for other tests
      vi.mocked(serverEnvironment).AZUREAD_CLIENT_ID = 'test-client-id';
    });

    it('should throw authentication error when token request fails', async () => {
      const mockTokenResponse = {
        ok: false,
        status: 401,
        text: vi.fn().mockResolvedValue('Invalid client credentials'),
      };

      (global.fetch as any).mockResolvedValueOnce(mockTokenResponse);

      await expect(service.getUserFromMSGraph('test-user-id')).rejects.toMatchObject({
        msg: 'Failed to obtain access token from Azure AD. Status: 401. Error: Invalid client credentials',
        errorCode: ErrorCodes.AUTHENTICATION_ERROR,
      });
    });

    it('should throw MS Graph API error when user request fails with non-404 error', async () => {
      const mockTokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'mock-access-token',
        }),
      };

      const mockUserResponse = {
        ok: false,
        status: 403,
        text: vi.fn().mockResolvedValue('Insufficient privileges'),
      };

      (global.fetch as any).mockResolvedValueOnce(mockTokenResponse).mockResolvedValueOnce(mockUserResponse);

      await expect(service.getUserFromMSGraph('test-user-id')).rejects.toMatchObject({
        msg: 'Failed to retrieve user from Microsoft Graph. Status: 403. Error: Insufficient privileges',
        errorCode: ErrorCodes.MSGRAPH_API_ERROR,
      });
    });

    it('should use "common" tenant when AZUREAD_TENANT_ID is not set', async () => {
      // Temporarily remove tenant ID
      const originalTenantId = vi.mocked(serverEnvironment).AZUREAD_TENANT_ID;
      vi.mocked(serverEnvironment).AZUREAD_TENANT_ID = undefined;

      const mockTokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'mock-access-token',
        }),
      };

      const mockUserResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          id: 'test-user-id',
          displayName: 'Test User',
        }),
      };

      (global.fetch as any).mockResolvedValueOnce(mockTokenResponse).mockResolvedValueOnce(mockUserResponse);

      await service.getUserFromMSGraph('test-user-id');

      // Verify it uses "common" tenant
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        expect.any(Object),
      );

      // Restore original value
      vi.mocked(serverEnvironment).AZUREAD_TENANT_ID = originalTenantId;
    });

    it('should properly encode Active Directory ID in URL', async () => {
      const mockTokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'mock-access-token',
        }),
      };

      const mockUserResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          id: 'test@user.com',
          displayName: 'Test User',
        }),
      };

      (global.fetch as any).mockResolvedValueOnce(mockTokenResponse).mockResolvedValueOnce(mockUserResponse);

      await service.getUserFromMSGraph('test@user.com');

      // Verify the user ID is properly encoded in the URL
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://graph.microsoft.com/v1.0/users/test%40user.com',
        expect.any(Object),
      );
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getUserFromMSGraph('test-user-id')).rejects.toMatchObject({
        msg: 'Unexpected error occurred while retrieving user from Microsoft Graph: Network error',
        errorCode: ErrorCodes.MSGRAPH_API_ERROR,
      });
    });

    it('should handle non-Error exceptions gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce('String error');

      await expect(service.getUserFromMSGraph('test-user-id')).rejects.toMatchObject({
        msg: 'Unexpected error occurred while retrieving user from Microsoft Graph: String error',
        errorCode: ErrorCodes.MSGRAPH_API_ERROR,
      });
    });
  });
});
