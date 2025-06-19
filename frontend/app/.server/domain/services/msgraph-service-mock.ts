import type { MSGraphUser, User } from '~/.server/domain/models';
import type { MSGraphService } from '~/.server/domain/services/msgraph-service';

/**
 * Mock implementation of MSGraphService for testing and development.
 * Returns simulated Microsoft Graph user data without making actual API calls.
 */
export function getMockMSGraphService(): MSGraphService {
  return {
    /**
     * Mock implementation for retrieving user information from Microsoft Graph API.
     * Returns mock MS Graph user data based on Active Directory ID.
     *
     * @param activeDirectoryId The Active Directory ID of the user to retrieve.
     * @returns Mock MS Graph user object if found, null otherwise.
     */
    async getUserFromMSGraph(activeDirectoryId: string): Promise<MSGraphUser | null> {
      try {
        return Promise.resolve(getMockMSGraphUser(activeDirectoryId));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
}

/**
 * Mock user data for testing and development.
 * This mirrors the data structure from the user service mock but focuses on MS Graph representation.
 */
const mockUsers: readonly User[] = [
  {
    id: 1,
    name: 'Jane Doe',
    activeDirectoryId: '00000000-0000-0000-0000-000000000001',
    role: 'employee',
    privacyConsentAccepted: true,
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'John Doe',
    activeDirectoryId: '11111111-1111-1111-1111-111111111111',
    role: 'employee',
    privacyConsentAccepted: true,
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Jane Smith',
    activeDirectoryId: '22222222-2222-2222-2222-222222222222',
    role: 'employee',
    privacyConsentAccepted: true,
    createdBy: 'system',
    createdDate: '2024-01-02T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-02T00:00:00Z',
  },
  {
    id: 4,
    name: 'Michel Tremblay',
    activeDirectoryId: '33333333-3333-3333-3333-333333333333',
    role: 'hiring-manager',
    privacyConsentAccepted: true,
    createdBy: 'system',
    createdDate: '2024-01-03T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-03T00:00:00Z',
  },
];

/**
 * Creates mock Microsoft Graph user data based on Active Directory ID.
 *
 * @param activeDirectoryId The Active Directory ID of the user to retrieve.
 * @returns Mock MS Graph user object if found, null otherwise.
 */
function getMockMSGraphUser(activeDirectoryId: string): MSGraphUser | null {
  // Find the corresponding user in our mock data
  const user = mockUsers.find((u) => u.activeDirectoryId === activeDirectoryId);

  if (!user) {
    return null;
  }

  // Create mock MS Graph user data based on the local user
  const msGraphUser: MSGraphUser = {
    id: activeDirectoryId,
    displayName: user.name,
    givenName: user.name.split(' ')[0] ?? user.name,
    surname: user.name.split(' ').slice(1).join(' ') || undefined,
    mail: `${user.name.toLowerCase().replace(/\s+/g, '.')}@esdc-edsc.gc.ca`,
    userPrincipalName: `${user.name.toLowerCase().replace(/\s+/g, '.')}@esdc-edsc.gc.ca`,
    jobTitle: user.role === 'hiring-manager' ? 'Hiring Manager' : 'Employee',
    department: 'Employment and Social Development Canada',
    officeLocation: 'Ottawa, ON',
    businessPhones: ['+1 613 555 0123'],
    mobilePhone: '+1 613 555 0456',
  };

  return msGraphUser;
}
