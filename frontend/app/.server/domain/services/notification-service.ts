import type {
  NotificationEmailResponseOK,
  NotificationEmailResponseError,
  NotificationEmailRequest,
} from '~/.server/domain/models';
import { getDefaultNotificationService } from '~/.server/domain/services/notification-service-default';
import { getMockNotificationService } from '~/.server/domain/services/notification-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type NotificationService = {
  sendEmailNotification(
    emailData: NotificationEmailRequest,
  ): Promise<NotificationEmailResponseOK | NotificationEmailResponseError>;
};

export function getNotificationService(): NotificationService {
  return serverEnvironment.ENABLE_PROFILE_SERVICES_MOCK ? getMockNotificationService() : getDefaultNotificationService();
}
