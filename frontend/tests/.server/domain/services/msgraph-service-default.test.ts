import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { MockedFunction } from 'vitest';

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
const mockFetch = vi.fn() as MockedFunction<typeof fetch>;
global.fetch = mockFetch;

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
      } as Partial<Response>;

      mockFetch.mockResolvedValueOnce(mockUserResponse as Response);

      const result = await service.getUserFromMSGraph('mock-access-token');

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
        state: '',
        city: '',
        preferredLanguage: '',
        onPremisesSamAccountName: '',
      });

      // Verify user request to /me endpoint
      expect(global.fetch).toHaveBeenCalledWith(
        'https://graph.microsoft.com/v1.0/me?$select=id,onPremisesSamAccountName,givenName,surname,businessPhones,mail,preferredLanguage,city,state,jobTitle,department,officeLocation,mobilePhone',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer mock-access-token',
            'Content-Type': 'application/json',
            'ConsistencyLevel': 'eventual',
          },
        },
      );
    });

    it('should return null when user is not found (404)', async () => {
      const mockUserResponse = {
        ok: false,
        status: HttpStatusCodes.NOT_FOUND,
      } as Partial<Response>;

      mockFetch.mockResolvedValueOnce(mockUserResponse as Response);

      const result = await service.getUserFromMSGraph('mock-access-token');

      expect(result).toBeNull();
    });

    it('should handle missing optional fields in MS Graph response', async () => {
      const mockUserResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          id: 'test-user-id',
          displayName: 'Minimal User',
          // Missing optional fields like givenName, surname, etc.
        }),
      } as Partial<Response>;

      mockFetch.mockResolvedValueOnce(mockUserResponse as Response);

      const result = await service.getUserFromMSGraph('mock-access-token');

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
        state: '',
        city: '',
        preferredLanguage: '',
        onPremisesSamAccountName: '',
      });
    });

    it('should throw authentication error when client credentials are missing', async () => {
      // Mock environment without client credentials
      vi.mocked(serverEnvironment).AZUREAD_CLIENT_ID = undefined;

      await expect(service.getUserFromMSGraph('test-auth-code')).rejects.toMatchObject({
        msg: 'Azure AD client credentials are not configured. Please set AZUREAD_CLIENT_ID and AZUREAD_CLIENT_SECRET environment variables.',
        errorCode: ErrorCodes.AUTHENTICATION_ERROR,
      });

      // Restore for other tests
      vi.mocked(serverEnvironment).AZUREAD_CLIENT_ID = 'test-client-id';
    });

    it('should throw MS Graph API error when user request fails with non-404 error', async () => {
      const mockUserResponse = {
        ok: false,
        status: 403,
        text: vi.fn().mockResolvedValue('Insufficient privileges'),
      } as Partial<Response>;

      mockFetch.mockResolvedValueOnce(mockUserResponse as Response);

      await expect(service.getUserFromMSGraph('mock-access-token')).rejects.toMatchObject({
        msg: 'Failed to retrieve user from Microsoft Graph. Status: 403. Error: Insufficient privileges',
        errorCode: ErrorCodes.MSGRAPH_API_ERROR,
      });
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getUserFromMSGraph('mock-access-token')).rejects.toMatchObject({
        msg: 'Unexpected error occurred while retrieving user from Microsoft Graph: Network error',
        errorCode: ErrorCodes.MSGRAPH_API_ERROR,
      });
    });

    it('should handle non-Error exceptions gracefully', async () => {
      mockFetch.mockRejectedValueOnce('String error');

      await expect(service.getUserFromMSGraph('mock-access-token')).rejects.toMatchObject({
        msg: 'Unexpected error occurred while retrieving user from Microsoft Graph: String error',
        errorCode: ErrorCodes.MSGRAPH_API_ERROR,
      });
    });
  });
});
