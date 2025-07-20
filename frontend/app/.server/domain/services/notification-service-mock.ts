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
  id: '0de093e1-fake-4444-fake-736666661962',
  reference: null,
  uri: 'https://api.example.com',
  template: {
    id: 'b78df0ea-fake-4444-fake-4b433444444',
    version: 1,
    uri: 'https://api.exmaple.com',
  },
  scheduled_for: null,
  content: {
    from_email: 'for.testing@example.com',
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
  return emailResult;
}
