import { expect, test } from '@playwright/test';

test('Navigating to / redirects to the default language page', async ({ page }) => {
  await page.goto('/');

  expect(await page.locator('main').innerHTML()).toMatchSnapshot();
});
