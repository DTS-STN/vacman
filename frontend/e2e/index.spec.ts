import { expect, test } from '@playwright/test';

test.describe('Splash Page Language Selection', () => {
  test('Navigating to / shows splash page and allows selection of English or Français', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1.sr-only')).toContainText('Language selectionSélection de la langue');

    // Click the English button
    await page.locator('section[lang="en"] a:has-text("English")').click();

    await expect(page).toHaveURL(/\/en/);
  });

  test('Navigating to / shows splash page and allows selection of French', async ({ page }) => {
    await page.goto('/');

    // Click the French button
    await page.locator('section[lang="fr"] a:has-text("Français")').click();

    await expect(page).toHaveURL(/\/fr/);
  });
});
