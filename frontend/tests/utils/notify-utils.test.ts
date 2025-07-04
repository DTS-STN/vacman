import { describe, expect, it, vi, beforeEach } from 'vitest';

import { DefaultHttpClient } from '~/http/http-client';

import { DefaultVerificationCodeRepository } from '~/utils/gc-notify';

const serverConfig = {
  GC_NOTIFY_API_KEY: 'gcntfy-vacman-test-70b3e3ae-e686-4d02-8570-a1e2c95cfedd-2ec5720c-5138-44d7-902f-d0674ddd5c30',
  HTTP_PROXY_URL: '',
  INTEROP_API_BASE_URI: 'https://api.notification.canada.ca/v2/notifications/email', 
  INTEROP_API_SUBSCRIPTION_KEY: '',
};

const httpClient = new DefaultHttpClient();

const notifyEmail = 'marco.flores@hrsdc-rhdcc.gc.ca';
const notifyEngEmail = 'b78df0ea-a143-4fa3-bd00-4b42fa5fdf0d';
const notifyFrEmail = 'df50b077-b274-45c9-9efa-8e016e9dadb2';

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

describe('notfy-utils', () => {
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
