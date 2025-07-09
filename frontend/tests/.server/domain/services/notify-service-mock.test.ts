import { describe, expect, it } from 'vitest';

import type { NotificationEmailRequest, NotificationEmailResponseError } from '~/.server/domain/models';
import { getDefaultNotificationService } from '~/.server/domain/services/notification-service-default';
import { serverEnvironment } from '~/.server/environment';

describe('getMockNotificationService', () => {
  //
  const notificationService = getDefaultNotificationService();

  const engParams: NotificationEmailRequest = {
    email_address: 'simulate-delivered@notification.canada.ca',
    template_id: `${serverEnvironment.GC_NOTIFY_ENGLISH_TEMPLATE_ID}`,
    personalisation: {
      emailVerificationCode: '123456MOCK',
    },
  };

  // not sure why the mock service is returning a 403
  const mockEmailResultError403: NotificationEmailResponseError = {
    status_code: 403,
    errors: [
      {
        error: 'AuthError',
        message: 'Invalid token: Enter your full API key',
      },
    ],
  };

  describe('sendEmailNotification', () => {
    //
    it('should Mock sending an email to gc-notify in english', async () => {
      //
      const response = await notificationService.sendEmailNotification(engParams);

      expect(response).toEqual(mockEmailResultError403);
    });
  });
});
