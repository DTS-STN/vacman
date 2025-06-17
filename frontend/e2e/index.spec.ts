import { expect, test } from '@playwright/test';

test('Navigating to / redirects to authentication when not logged in', async ({ page }) => {
  await page.goto('/');
  // When not authenticated, the app should redirect to Microsoft authentication
  await expect(page).toHaveURL(/login\.microsoftonline\.com/);
});
