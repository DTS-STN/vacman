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
     * @param activeDirectoryId The Active Directory ID (object ID) of the user to retrieve.
     * @returns A promise that resolves to the MS Graph user object, or null if not found.
     * @throws AppError if authentication fails or if the request encounters an error.
     */
    async getUserFromMSGraph(activeDirectoryId: string): Promise<MSGraphUser | null> {
      try {
        // Validate required configuration
        if (!serverEnvironment.AZUREAD_CLIENT_ID || !serverEnvironment.AZUREAD_CLIENT_SECRET) {
          throw new AppError(
            'Azure AD client credentials are not configured. Please set AZUREAD_CLIENT_ID and AZUREAD_CLIENT_SECRET environment variables.',
            ErrorCodes.AUTHENTICATION_ERROR,
          );
        }

        // Get access token using client credentials flow
        const tokenResponse = await fetch(`${serverEnvironment.AZUREAD_ISSUER_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: serverEnvironment.AZUREAD_CLIENT_ID,
            client_secret: serverEnvironment.AZUREAD_CLIENT_SECRET.value(),
            scope: 'https://graph.microsoft.com/.default',
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new AppError(
            `Failed to obtain access token from Azure AD. Status: ${tokenResponse.status}. Error: ${errorText}`,
            ErrorCodes.AUTHENTICATION_ERROR,
          );
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Query Microsoft Graph API for user information
        const userResponse = await fetch(
          `${serverEnvironment.MSGRAPH_BASE_URL}/users/${encodeURIComponent(activeDirectoryId)}?$select=id,onPremisesSamAccountName,givenName,surname,businessPhones,mail,preferredLanguage,city,state`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
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
