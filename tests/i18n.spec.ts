import { test, expect } from '@playwright/test';

test.describe('Eating Helper - Multi-Language System & Outsourcing Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock user for authenticated dashboard testing
    await page.addInitScript(() => {
      localStorage.setItem(
        'eh_e2e_user',
        JSON.stringify({
          uid: 'e2e_test_user',
          email: 'test@example.com',
          displayName: 'Test User',
          providerData: [{ providerId: 'password' }],
        })
      );
    });
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should cycle languages via Header globe button and update UI strings', async ({ page }) => {
    const langBtn = page.locator('header button:has(svg.lucide-globe)');

    // 1. Initial Portuguese (PT) state
    await expect(page.locator('button:visible:has-text("Hoje")').first()).toBeVisible();
    await expect(langBtn).toBeVisible();

    // 2. Cycle to Portuguese (BR)
    await langBtn.click();
    await expect(langBtn).toContainText(/pt-br/i);

    // 3. Cycle to English
    await langBtn.click();
    await expect(page.locator('button:visible:has-text("Today")').first()).toBeVisible();
    await expect(langBtn).toContainText(/en/i);

    // 4. Cycle to Spanish
    await langBtn.click();
    await expect(page.locator('button:visible:has-text("Hoy")').first()).toBeVisible();
    await expect(langBtn).toContainText(/es/i);

    // 5. Cycle back to Portuguese (PT)
    await langBtn.click();
    await expect(page.locator('button:visible:has-text("Hoje")').first()).toBeVisible();
    await expect(langBtn).toContainText(/pt$/i);
  });

  test('should switch languages via Settings modal and reflect choices immediately', async ({ page }) => {
    // Open settings
    await page.locator('button[title*="Configurações"], button[title*="Settings"]').click();
    const modal = page.locator('.fixed.inset-0');
    await expect(modal).toBeVisible();

    // Click Português (BR) button inside Settings
    await page.locator('button:has-text("Português (BR)")').click();

    // Verify Save button changes to "Salvar Alterações" (PT-BR)
    await expect(page.locator('button:has-text("Salvar Alterações")')).toBeVisible();
    await page.locator('button:has-text("Salvar Alterações")').click();

    // Verify Header reflects PT-BR
    await expect(page.locator('button:has-text("PT-BR")')).toBeVisible();

    // Reopen Settings and switch to Español
    await page.locator('button[title*="Configurações"], button[title*="Settings"]').click();
    await page.locator('button:has-text("Español")').click();

    // Verify Settings Title changes to "Ajustes"
    await expect(page.locator('h2:has-text("Ajustes")')).toBeVisible();

    // Click Guardar Ajustes
    await page.locator('button:has-text("Guardar Ajustes")').click();

    // Verify Tab is now "Hoy"
    await expect(page.locator('button:visible:has-text("Hoy")').first()).toBeVisible();
  });
});
