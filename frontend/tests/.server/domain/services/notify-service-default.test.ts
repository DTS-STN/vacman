import { describe, expect, it, vi, beforeEach } from 'vitest';

import type {
  NotificationEmailRequest,
  NotificationEmailResponseOK,
  NotificationEmailResponseError,
} from '~/.server/domain/models';
import { getDefaultNotificationService } from '~/.server/domain/services/notification-service-default';
import { serverEnvironment } from '~/.server/environment';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('notification-service-default', () => {
  //
  const notificationService = getDefaultNotificationService();

  const notifyEmail = 'simulate-delivered@notification.canada.ca';
  const notifyEngEmail = `${serverEnvironment.GC_NOTIFY_ENGLISH_TEMPLATE_ID}`;
  const notifyFrEmail = `${serverEnvironment.GC_NOTIFY_FRENCH_TEMPLATE_ID}`;

  const engParams: NotificationEmailRequest = {
    email_address: notifyEmail,
    template_id: notifyEngEmail,
    personalisation: {
      emailVerificationCode: '123456',
    },
  };

  const frParams: NotificationEmailRequest = {
    email_address: notifyEmail,
    template_id: notifyFrEmail,
    personalisation: {
      emailVerificationCode: '123456',
    },
  };

  const mockEmailResultOK: NotificationEmailResponseOK = {
    id: '0de093e1-fa55-4444-2222-736666661962',
    reference: null,
    uri: 'https://api.notification.canada.ca/v2/notifications/0de093e1-8888-77777-4444-73a0e8351962',
    template: {
      id: 'b78df0ea-4444-4444-4444-4b433444444',
      version: 1,
      uri: 'https://api.notification.canada.ca/services/70b3e3ae-6666-4444-8888-a1e2c95cfedd/templates/b78df0ea-4444-4444-4444-4b433444444',
    },
    scheduled_for: null,
    content: {
      from_email: 'vacman@notification.canada.ca',
      body: 'test for template from vacman',
      subject: 'vacman english',
    },
  };

  const mockEmailResultError400: NotificationEmailResponseError = {
    status_code: 400,
    errors: [
      {
        error: 'ValidationError',
        message: 'template_id is not a valid UUID',
      },
    ],
  };

  const mockEmailResultError403: NotificationEmailResponseError = {
    status_code: 403,
    errors: [
      {
        error: 'AuthError',
        message: 'Invalid token: API key not found',
      },
    ],
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('sendEmailNotification', () => {
    //
    it('should mock sending an email to gc-notify in english', async () => {
      //
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: HttpStatusCodes.OK,
        json: vi.fn().mockResolvedValueOnce(mockEmailResultOK),
      });

      const response = await notificationService.sendEmailNotification(engParams);

      expect(response).toEqual(mockEmailResultOK);
    });

    it('should mock sending an email to gc-notify in french', async () => {
      //
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: HttpStatusCodes.OK,
        json: vi.fn().mockResolvedValueOnce(mockEmailResultOK),
      });

      const response = await notificationService.sendEmailNotification(frParams);

      expect(response).toEqual(mockEmailResultOK);
    });

    it('should mock sending an email with an invalid template_id', async () => {
      //
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.BAD_REQUEST,
        statusText: 'Bad Request',
        json: vi.fn().mockResolvedValueOnce(mockEmailResultError400),
      });

      const response = await notificationService.sendEmailNotification(engParams);

      expect(response).toEqual(mockEmailResultError400);
    });

    it('should mock sending an email with an invalid API-Key', async () => {
      //
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.FORBIDDEN,
        statusText: 'Forbidden',
        json: vi.fn().mockResolvedValueOnce(mockEmailResultError403),
      });

      const response = await notificationService.sendEmailNotification(engParams);

      expect(response).toEqual(mockEmailResultError403);
    });
  });
});
