import { describe, it, vi } from 'vitest';

import { apiService } from '~/.server/domain/services/api/api.service';

vi.mock('~/.server/environment', () => ({
  serverEnvironment: {
    VACMAN_API_BASE_URI: 'https://vacman-uat-api.dev-dp-internal.dts-stn.com/api',
  },
}));

describe('ApiClient Integration Test', () => {
  it('should fetch cities from the live API', async () => {
    console.log(await apiService.getCities());
  });
});
