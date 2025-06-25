import type { MSGraphUser } from '~/.server/domain/models';
import type { MSGraphService } from '~/.server/domain/services/msgraph-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

/**
 * Production implementation of MSGraphService that makes actual calls to Microsoft Graph API.
 * Uses Azure AD client credentials flow for authentication.
 */
export function getDefaultMSGraphService(): MSGraphService {
  return {
    /**
     * Retrieves user information from Microsoft Graph API.
     * Uses client credentials flow for authentication with Azure AD.
     * @param authCode The token to be passed to the Microsoft Graph API for authentication.
     * @returns A promise that resolves to the MS Graph user object, or null if not found.
     * @throws AppError if authentication fails or if the request encounters an error.
     */
    async getUserFromMSGraph(authCode: string): Promise<MSGraphUser | null> {
      try {
        // Validate required configuration
        if (!serverEnvironment.AZUREAD_CLIENT_ID || !serverEnvironment.AZUREAD_CLIENT_SECRET) {
          throw new AppError(
            'Azure AD client credentials are not configured. Please set AZUREAD_CLIENT_ID and AZUREAD_CLIENT_SECRET environment variables.',
            ErrorCodes.AUTHENTICATION_ERROR,
          );
        }

        // Query Microsoft Graph API for user information
        const userResponse = await fetch(
          `${serverEnvironment.MSGRAPH_BASE_URL}/me?$select=id,onPremisesSamAccountName,givenName,surname,businessPhones,mail,preferredLanguage,city,state,jobTitle,department,officeLocation,mobilePhone`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authCode}`,
              'Content-Type': 'application/json',
              'ConsistencyLevel': 'eventual', // For advanced queries
            },
          },
        );

        if (userResponse.status === HttpStatusCodes.NOT_FOUND) {
          return null;
        }

        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          throw new AppError(
            `Failed to retrieve user from Microsoft Graph. Status: ${userResponse.status}. Error: ${errorText}`,
            ErrorCodes.MSGRAPH_API_ERROR,
          );
        }

        const userData = await userResponse.json();

        // Map Microsoft Graph user response to our MSGraphUser type
        const msGraphUser: MSGraphUser = {
          id: userData.id,
          displayName: userData.displayName ?? '',
          givenName: userData.givenName,
          surname: userData.surname,
          mail: userData.mail,
          userPrincipalName: userData.userPrincipalName ?? '',
          jobTitle: userData.jobTitle,
          department: userData.department,
          officeLocation: userData.officeLocation,
          businessPhones: userData.businessPhones ?? [],
          mobilePhone: userData.mobilePhone,
          state: userData.state ?? '',
          city: userData.city ?? '',
          preferredLanguage: userData.preferredLanguage ?? '',
          onPremisesSamAccountName: userData.onPremisesSamAccountName ?? '',
        };

        return msGraphUser;
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }

        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new AppError(
          `Unexpected error occurred while retrieving user from Microsoft Graph: ${errorMessage}`,
          ErrorCodes.MSGRAPH_API_ERROR,
        );
      }
    },
  };
}
