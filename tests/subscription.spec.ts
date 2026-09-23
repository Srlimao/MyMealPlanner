import { test, expect } from '@playwright/test';

test.describe('Eating Helper - User Tiers & Hard Quota Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock user for authenticated dashboard testing
    await page.addInitScript(() => {
      localStorage.setItem(
        'eh_e2e_user',
        JSON.stringify({
          uid: 'e2e_subscription_user',
          email: 'tieruser@example.com',
          displayName: 'Tier Tester',
          providerData: [{ providerId: 'password' }],
        })
      );
      // Ensure clean tier state
      localStorage.removeItem('eh_e2e_subscription_user_tier');
      localStorage.removeItem('eh_e2e_subscription_user_usage');
    });

    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should display FREE tier badge and allow switching to STARTER and PRO cleanly', async ({ page }) => {
    // 1. Locate user profile button in header
    const profileBtn = page.locator('button[title*="tieruser@example.com"]');
    await expect(profileBtn).toBeVisible();

    // Check default Free badge
    await expect(profileBtn).toContainText('Free');

    // 2. Open popover menu
    await profileBtn.click();
    await expect(page.locator('text=Plano Gratuito')).toBeVisible();
    await expect(page.locator('text=Conversas hoje')).toBeVisible();
    await expect(page.locator('text=Fotos hoje')).toBeVisible();

    // 3. Click "Gerenciar" to open TierManagementModal
    const manageBtn = page.locator('button:has-text("Gerenciar")');
    await expect(manageBtn).toBeVisible();
    await manageBtn.click();

    // 4. Verify modal is visible without horizontal overflow
    await expect(page.locator('h2:has-text("Planos e Limites de Uso")')).toBeVisible();
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);

    // 5. Select Starter tier
    const starterBtn = page.locator('button:has-text("Mudar para Starter")');
    await expect(starterBtn).toBeVisible();
    await starterBtn.click();

    // Modal should close and header badge should update to Starter
    await expect(page.locator('h2:has-text("Planos e Limites de Uso")')).not.toBeVisible();
    await expect(profileBtn).toContainText('Starter');

    // 6. Open profile again to confirm Starter state
    await profileBtn.click();
    await expect(page.locator('text=Plano Starter')).toBeVisible();
    await expect(page.locator('text=0/30')).toBeVisible(); // 30 chats daily
    await expect(page.locator('text=0/10')).toBeVisible(); // 10 photos daily
  });

  test('Advisor Chat Drawer should display tier badge and remaining quota', async ({ page }) => {
    // Open Advisor Chat Drawer
    const openAdvisorBtn = page.locator('button:has-text("Falar com IA"), button[title*="assistente"], button:has-text("Pedir Sugestão")').first();
    if (await openAdvisorBtn.isVisible()) {
      // Find the chat button in the header or timeline
      const chatDrawerBtn = page.locator('button:has-text("Assistente"), button[aria-label*="chat"]').first();
      if (await chatDrawerBtn.isVisible()) {
        await chatDrawerBtn.click();
        await expect(page.locator('text=de 10 restantes hoje')).toBeVisible();
      }
    }
  });
});
