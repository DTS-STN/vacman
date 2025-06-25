import type { MSGraphUser } from '~/.server/domain/models';
import { getDefaultMSGraphService } from '~/.server/domain/services/msgraph-service-default';
import { getMockMSGraphService } from '~/.server/domain/services/msgraph-service-mock';
import { serverEnvironment } from '~/.server/environment';

/**
 * Service interface for Microsoft Graph API operations.
 * Provides methods to interact with Microsoft Graph API to retrieve user information.
 */
export type MSGraphService = {
  /**
   * Retrieves user information from Microsoft Graph API by Active Directory ID.
   * @param activeDirectoryId The Active Directory ID (object ID) of the user to retrieve.
   * @returns A promise that resolves to the MS Graph user object, or null if not found.
   * @throws AppError if authentication fails or if the request encounters an error.
   */
  getUserFromMSGraph(authCode: string): Promise<MSGraphUser | null>;
};

/**
 * Factory function to get the appropriate MSGraphService implementation
 * based on the current environment configuration.
 *
 * @returns The MSGraphService implementation (mock or real)
 */
export function getMSGraphService(): MSGraphService {
  return serverEnvironment.ENABLE_MSGRAPH_SERVICES_MOCK ? getMockMSGraphService() : getDefaultMSGraphService();
}
