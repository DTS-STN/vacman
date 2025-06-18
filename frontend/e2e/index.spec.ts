import { expect, test } from '@playwright/test';

test('Navigating to / routes to /en by default', async ({ page }) => {
  await page.goto('/');
  // The app should route to /en by default
  await expect(page).toHaveURL(/\/en/);
});
