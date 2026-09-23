import { test, expect } from '@playwright/test';

test.describe('Eating Helper - Multi-Language System & Outsourcing Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should cycle languages via Header globe button and update UI strings', async ({ page }) => {
    // 1. Initial Portuguese (PT) state
    await expect(page.locator('button:visible:has-text("Hoje")').first()).toBeVisible();

    // 2. Cycle to Portuguese (BR)
    const langBtnPt = page.locator('button:has-text("PT"):not(:has-text("PT-BR"))');
    await expect(langBtnPt).toBeVisible();
    await langBtnPt.click();

    // Verify Brazilian Portuguese button and state
    await expect(page.locator('button:has-text("PT-BR")')).toBeVisible();

    // 3. Cycle to English
    await page.locator('button:has-text("PT-BR")').click();
    await expect(page.locator('button:visible:has-text("Today")').first()).toBeVisible();
    await expect(page.locator('button:has-text("EN")')).toBeVisible();

    // 4. Cycle to Spanish
    await page.locator('button:has-text("EN")').click();
    await expect(page.locator('button:visible:has-text("Hoy")').first()).toBeVisible();
    await expect(page.locator('button:has-text("ES")')).toBeVisible();

    // 5. Cycle back to Portuguese (PT)
    await page.locator('button:has-text("ES")').click();
    await expect(page.locator('button:visible:has-text("Hoje")').first()).toBeVisible();
    await expect(page.locator('button:has-text("PT"):not(:has-text("PT-BR"))')).toBeVisible();
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
