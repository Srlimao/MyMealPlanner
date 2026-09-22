import { test, expect } from '@playwright/test';

test.describe('Eating Helper - Responsive Design & Overflow Verification', () => {
  test.beforeEach(async ({ page }) => {
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
});
