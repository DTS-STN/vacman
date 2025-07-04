import { describe, expect, it, vi, beforeEach } from 'vitest';

import { DefaultHttpClient } from '~/http/http-client';

import { DefaultVerificationCodeRepository } from '~/utils/gc-notify';

const serverConfig = {
  GC_NOTIFY_API_KEY: process.env.GC_NOTIFY_API_KEY ?? '',
  HTTP_PROXY_URL: '',
  GC_NOTIFY_API_URL: process.env.GC_NOTIFY_API_URL ?? '', 
  INTEROP_API_BASE_URI: '',
  INTEROP_API_SUBSCRIPTION_KEY: '',
};

const httpClient = new DefaultHttpClient();

const notifyEmail = 'simulate-delivered@notification.canada.ca';
const notifyEngEmail = process.env.GC_NOTIFY_ENGLISH_TEMPLATE_ID ?? '';
const notifyFrEmail = process.env.GC_NOTIFY_ENGLISH_TEMPLATE_ID ?? '';

const sendEmail = new DefaultVerificationCodeRepository(serverConfig, httpClient);

const engParams = {
  email_address: notifyEmail,
  template_id: notifyEngEmail,
  personalisation: {
    EmailVerificationCode: '123456',
  },
};

const frParams = {
  email_address: notifyEmail,
  template_id: notifyFrEmail,
  personalisation: {
    EmailVerificationCode: '123456',
  },
};

beforeEach(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

describe('notify-utils', () => {
  it('should mock sending an email to gc-notify in english', async () => {
    // Arrange: mock fetch to simulate a successful response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
          ok: true,
          json: () => ( 200 ),
        });

    const response = await sendEmail.sendVerificationCodeEmail(engParams);

    expect(response).toEqual(200);
  });

  it('should mock sending an email to gc-notify in french', async () => {
    // Arrange: mock fetch to simulate a successful response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
          ok: true,
          json: () => ( 200 ),
        });

    const response = await sendEmail.sendVerificationCodeEmail(frParams);

    expect(response).toEqual(200);
  });
});
