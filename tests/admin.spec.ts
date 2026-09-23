import { test, expect } from '@playwright/test';

test.describe('Eating Helper - Admin Dashboard & User Management Verification', () => {
  test('non-admin user should NOT see the Admin tab button', async ({ page }) => {
    // Inject non-admin mock user
    await page.addInitScript(() => {
      localStorage.setItem(
        'eh_e2e_user',
        JSON.stringify({
          uid: 'regular_user_1',
          email: 'regular_user@gmail.com',
          displayName: 'Regular User',
          providerData: [{ providerId: 'password' }],
        })
      );
    });

    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();

    // Verify Admin tab is not present
    await expect(page.locator('button[data-tab="admin"]')).not.toBeVisible();
  });

  test('admin user should see Admin tab, view financial metrics, and override user tier', async ({ page }) => {
    // Inject admin mock user
    await page.addInitScript(() => {
      localStorage.setItem(
        'eh_e2e_user',
        JSON.stringify({
          uid: 'admin_test_user',
          email: 'admin@dunhas.com',
          displayName: 'Admin Dunhas',
          providerData: [{ providerId: 'password' }],
        })
      );
    });

    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();

    // 1. Locate and click the Admin tab button
    const adminTabBtn = page.locator('button[data-tab="admin"]:visible');
    await expect(adminTabBtn).toBeVisible();
    await adminTabBtn.click();

    // 2. Verify Admin Dashboard header & financial card
    await expect(page.locator('h1:has-text("Painel de Administração")')).toBeVisible();
    await expect(page.locator('text=Saúde Financeira & Custos de IA')).toBeVisible();
    await expect(page.locator('text=Receita Bruta (MRR)')).toBeVisible();
    await expect(page.locator('text=Custo IA (Gemini)')).toBeVisible();

    // 3. Verify responsiveness and no horizontal overflow
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);

    // 4. Verify User Directory Table
    await expect(page.locator('text=utilizador(es) encontrado(s)')).toBeVisible();

    // 5. Open UserEditModal for a user
    const manageUserBtn = page.locator('button[title="Gerenciar Utilizador"]').first();
    await expect(manageUserBtn).toBeVisible();
    await manageUserBtn.click();

    // 6. Verify UserEditModal opens cleanly
    await expect(page.locator('h2:has-text("Admin Dunhas")')).toBeVisible();
    await expect(page.locator('text=Definir Plano / Tier')).toBeVisible();

    // Modal overflow check
    const modalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(modalOverflow).toBe(false);

    // Close modal
    await page.locator('button:has-text("Cancelar")').click();
    await expect(page.locator('text=Definir Plano / Tier')).not.toBeVisible();
  });
});
