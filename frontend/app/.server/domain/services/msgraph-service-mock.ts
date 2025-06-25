import type { MSGraphUser } from '~/.server/domain/models';
import type { MSGraphService } from '~/.server/domain/services/msgraph-service';

/**
 * Mock implementation of MSGraphService for testing and development.
 * Returns simulated Microsoft Graph user data without making actual API calls.
 */
export function getMockMSGraphService(): MSGraphService {
  return {
    /**
     * Mock implementation for retrieving user information from Microsoft Graph API.
     * Returns mock MS Graph user data based on the provided authentication code and optional Active Directory ID.
     *
     * @param authCode - The authentication code used to simulate user authentication.
     * @param activeDirectoryId - Optional Active Directory ID of the user to retrieve specific mock data.
     * @returns A Promise that resolves to a mock MSGraphUser object if successful, or null if user not found.
     * @throws Will reject the Promise if an error occurs during mock data retrieval.
     */
    async getUserFromMSGraph(authCode: string, activeDirectoryId?: string): Promise<MSGraphUser | null> {
      try {
        return Promise.resolve(getMockMSGraphUser(authCode, activeDirectoryId));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
}

/**
 * Mock Microsoft Graph user data for testing and development.
 * Contains MSGraphUser objects that match exactly the MSGraphUser type.
 */
const mockUsers: readonly MSGraphUser[] = [
  {
    id: '00000000-0000-0000-0000-000000000000',
    displayName: 'Jane Doe',
    givenName: 'Jane',
    surname: 'Doe',
    mail: 'jane.doe@esdc-edsc.gc.ca',
    userPrincipalName: 'jane.doe@esdc-edsc.gc.ca',
    jobTitle: 'Application Developer',
    department: 'Employment and Social Development Canada',
    officeLocation: 'Ottawa, ON',
    businessPhones: ['+1 613 555 0123'],
    mobilePhone: '+1 613 555 0456',
    state: 'Ontario',
    city: 'Ottawa',
    preferredLanguage: 'en-CA',
    onPremisesSamAccountName: 'jane.doe',
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    displayName: 'John Doe',
    givenName: 'John',
    surname: 'Doe',
    mail: 'john.doe@esdc-edsc.gc.ca',
    userPrincipalName: 'john.doe@esdc-edsc.gc.ca',
    jobTitle: 'Software Developer',
    department: 'Employment and Social Development Canada',
    officeLocation: 'Toronto, ON',
    businessPhones: ['+1 416 555 0789'],
    mobilePhone: '+1 416 555 0987',
    state: 'Ontario',
    city: 'Toronto',
    preferredLanguage: 'en-CA',
    onPremisesSamAccountName: 'john.doe',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    displayName: 'Jane Smith',
    givenName: 'Jane',
    surname: 'Smith',
    mail: 'jane.smith@esdc-edsc.gc.ca',
    userPrincipalName: 'jane.smith@esdc-edsc.gc.ca',
    jobTitle: 'Business Analyst',
    department: 'Employment and Social Development Canada',
    officeLocation: 'Vancouver, BC',
    businessPhones: ['+1 604 555 0234'],
    mobilePhone: '+1 604 555 0567',
    state: 'British Columbia',
    city: 'Vancouver',
    preferredLanguage: 'en-CA',
    onPremisesSamAccountName: 'jane.smith',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    displayName: 'Michel Tremblay',
    givenName: 'Michel',
    surname: 'Tremblay',
    mail: 'michel.tremblay@esdc-edsc.gc.ca',
    userPrincipalName: 'michel.tremblay@esdc-edsc.gc.ca',
    jobTitle: 'Hiring Manager',
    department: 'Employment and Social Development Canada',
    officeLocation: 'Montreal, QC',
    businessPhones: ['+1 514 555 0345'],
    mobilePhone: '+1 514 555 0678',
    state: 'Quebec',
    city: 'Montreal',
    preferredLanguage: 'fr-CA',
    onPremisesSamAccountName: 'michel.tremblay',
  },
];

/**
 * Creates mock Microsoft Graph user data based on Active Directory ID.
 *
 * @param authCode The authentication code (unused in mock implementation).
 * @param activeDirectoryId The Active Directory ID of the user to retrieve.
 * @returns Mock MS Graph user object if found, null otherwise.
 */
function getMockMSGraphUser(authCode: string, activeDirectoryId = '00000000-0000-0000-0000-000000000000'): MSGraphUser | null {
  // Find the corresponding user in our mock data using the id field
  const user = mockUsers.find((u) => u.id === activeDirectoryId);

  if (!user) {
    return null;
  }

  // Return the user directly since it's already in MSGraphUser format
  return user;
}
