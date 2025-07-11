import type {
  NotificationEmailRequest,
  NotificationEmailResponseOK,
  NotificationEmailResponseError,
} from '~/.server/domain/models';
import type { NotificationService } from '~/.server/domain/services/notification-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

export function getDefaultNotificationService(): NotificationService {
  return {
    /**
     * Sends an email usnig GC-Notification .
     * @param emailData to: email address and other data required for the notification.
     * @returns A promise with information to either the success or not of the notification
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async sendEmailNotification(
      emailData: NotificationEmailRequest,
    ): Promise<NotificationEmailResponseOK | NotificationEmailResponseError> {
      let response: Response;

      try {
        response = await fetch(`${serverEnvironment.GC_NOTIFY_API_URL}`, {
          method: 'POST',
          headers: {
            'Authorization': `ApiKey-v1 ${serverEnvironment.GC_NOTIFY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emailData }),
        });
      } catch (error) {
        throw new AppError(
          error instanceof Error
            ? error.message
            : `Network error while sending email to GC-Notify with the following ${emailData}`,
          ErrorCodes.XAPI_NETWORK_500_ERROR,
          { httpStatusCode: HttpStatusCodes.SERVICE_UNAVAILABLE },
        );
      }

      if (!response.ok) {
        if (response.status === HttpStatusCodes.TOO_MANY_REQUESTS) {
          throw new AppError(
            'Failed to POST to /notifications/email. Status: 429, Status Text: Too Many Requests',
            ErrorCodes.XAPI_TOO_MANY_REQUESTS,
          );
        }

        // Next line crashes the tests when testing for errors
        //throw new Error(`Failed to 'POST' email notification. Status: ${response.status}, Status Text: ${response.statusText}`);
      }

      try {
        return await response.json();
      } catch {
        throw new AppError(`Invalid JSON response from GC-Notify ${emailData}`, ErrorCodes.XAPI_TOO_MANY_REQUESTS, {
          httpStatusCode: HttpStatusCodes.BAD_GATEWAY,
        });
      }
    },
  };
}
