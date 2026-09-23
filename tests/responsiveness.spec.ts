import { test, expect } from '@playwright/test';

test.describe('Eating Helper - Responsive Design & Overflow Verification', () => {
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
    // Navigate to local dev server
    await page.goto('/');
    // Wait for the app container to mount
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should not have horizontal overflow on initial load', async ({ page }) => {
    // Assert scrollWidth does not exceed clientWidth
    const isOverflowing = await page.evaluate(() => {
      const docEl = document.documentElement;
      return docEl.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);

    // Assert main header is visible and within bounds
    const header = page.locator('header');
    await expect(header).toBeVisible();
    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
    }
  });

  test('should navigate across tabs without horizontal overflow', async ({ page, isMobile }) => {
    // Test Dashboard
    let hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);

    // Click Plan tab
    const mobileNav = page.locator('nav');
    const isMobileNavVisible = await mobileNav.isVisible();

    if (isMobileNavVisible) {
      await page.locator('nav button:has-text("Plano"), nav button:has-text("Plan")').click();
    } else {
      await page.locator('button:has-text("Plano"), button:has-text("Plan")').first().click();
    }
    await page.waitForTimeout(250);
    hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);

    // Click Metrics/History tab
    if (isMobileNavVisible) {
      await page.locator('nav button:has-text("Histórico"), nav button:has-text("Métricas"), nav button:has-text("History")').click();
    } else {
      await page.locator('button:has-text("Histórico"), button:has-text("Métricas"), button:has-text("History")').first().click();
    }
    await page.waitForTimeout(250);
    hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);
  });

  test('should open QuickLogModal and fit cleanly within screen boundaries', async ({ page }) => {
    // Open Quick Log modal
    await page.locator('button:has-text("Registar"), button:has-text("Log")').first().click();

    // Verify modal overlay and card exist
    const modal = page.locator('.fixed.inset-0').first();
    await expect(modal).toBeVisible();

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);

    // Close modal
    await page.locator('button:has-text("Cancelar"), button:has-text("Cancel")').click();
    await expect(page.locator('h2:has-text("Registar Refeição")')).not.toBeVisible();
  });

  test('should open Settings modal and fit without horizontal overflow', async ({ page }) => {
    // Open settings via header icon button
    await page.locator('button[title*="Configurações"], button[title*="Settings"]').click();

    const settingsTitle = page.locator('h2:has-text("Configurações"), h2:has-text("Settings")');
    await expect(settingsTitle).toBeVisible();

    // Verify newly added models are rendered in model selector
    await expect(page.locator('button:has-text("Gemini 3.5 Flash-Lite")')).toBeVisible();
    await expect(page.locator('button:has-text("Gemini 3.1 Flash-Lite")')).toBeVisible();
    await expect(page.locator('button:has-text("Gemma 4 26B")')).toBeVisible();

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);

    // Close settings
    await page.locator('button:has-text("Cancelar"), button:has-text("Cancel")').click();
  });

  test('should open Advisor Chat Drawer and stay within viewport', async ({ page }) => {
    // Click Ask AI in header
    await page.locator('button:has-text("Perguntar"), button:has-text("Ask")').click();

    const drawerTitle = page.locator('h3:has-text("Assistente Nutricional")');
    await expect(drawerTitle).toBeVisible();

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);
  });

  test('should open Plan Editor, switch section tabs, toggle markdown sync, and avoid horizontal overflow', async ({ page }) => {
    // Navigate to Plan tab
    const mobileNav = page.locator('nav');
    const isMobileNavVisible = await mobileNav.isVisible();
    if (isMobileNavVisible) {
      await page.locator('nav button:has-text("Plano"), nav button:has-text("Plan")').click();
    } else {
      await page.locator('button:has-text("Plano"), button:has-text("Plan")').first().click();
    }
    await page.waitForTimeout(250);

    // Open Plan Editor
    await page.locator('button:has-text("Editar Plano"), button:has-text("Edit Plan"), button:has-text("Editar Markdown")').click();

    // Verify Plan Editor header
    await expect(page.locator('h3:has-text("Editor do Plano Alimentar"), h3:has-text("Plan Editor")')).toBeVisible();

    // Check no overflow on visual tabs
    let isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(isOverflowing).toBe(false);

    // Switch to Commitments & Rules tab
    await page.locator('button:has-text("Compromissos"), button:has-text("Commitments")').click();
    await page.waitForTimeout(100);
    isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(isOverflowing).toBe(false);

    // Switch to Fruit Equivalencies tab
    await page.locator('button:has-text("Equivalências de Fruta"), button:has-text("Fruit Equivalencies")').click();
    await page.waitForTimeout(100);
    isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(isOverflowing).toBe(false);

    // Switch to Markdown mode
    await page.locator('button:has-text("Markdown")').click();
    await page.waitForTimeout(100);
    isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(isOverflowing).toBe(false);

    // Switch back to Visual mode
    await page.locator('button:has-text("Visual")').click();
    await page.waitForTimeout(100);
    isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(isOverflowing).toBe(false);

    // Open AI Import Modal
    await page.locator('button:has-text("Importar IA"), button:has-text("AI Import")').click();
    const modalTitle = page.locator('h3:has-text("Importar Plano com IA"), h3:has-text("Import Plan with AI")');
    await expect(modalTitle).toBeVisible();
    isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(isOverflowing).toBe(false);

    // Close AI modal
    await page.locator('button:has-text("Cancelar"), button:has-text("Cancel")').first().click();

    // Close editor and go back to viewer
    await page.locator('button:has-text("Voltar"), button:has-text("Back")').click();
  });
});
