import type {
  NotificationEmailRequest,
  NotificationEmailResponseOK,
  NotificationEmailResponseError,
} from '~/.server/domain/models';
import type { NotificationService } from '~/.server/domain/services/notification-service';

export function getMockNotificationService(): NotificationService {
  return {
    sendEmailNotification: (emailData: NotificationEmailRequest) => {
      const result = sendEmailNotification(emailData);
      return Promise.resolve(result);
    },
  };
}

/**
 * Mock email result for testing and development.
 */
const emailResult: NotificationEmailResponseOK = {
  id: '0de093e1-fa55-4444-2222-736666661962',
  reference: null,
  uri: 'https://api.notification.canada.ca/v2/notifications/0de093e1-fa55-4444-2222-736666661962',
  template: {
    id: 'b78df0ea-4444-4444-4444-4b433444444',
    version: 1,
    uri: 'https://api.notification.canada.ca/services/70b3e3ae-6666-4444-8888-a1e2c95cfedd/templates/b78df0ea-4444-4444-4444-4b433444444',
  },
  scheduled_for: null,
  content: {
    from_email: 'vacman@notification.canada.ca',
    body: 'test for template from vacman in english',
    subject: 'vacman english',
  },
};

/**
 * Sends an email, it returns a mock response.
 *
 * @param sendNotificationViaEmail data to send the the email.
 * @returns Result of the process.
 */
function sendEmailNotification(
  emailData: NotificationEmailRequest,
): NotificationEmailResponseOK | NotificationEmailResponseError {
  const result = emailResult;
  return result;
}
