import { test, expect } from '@playwright/test';

test.describe('Eating Helper - Authentication & AuthScreen Verification', () => {
  test('should display AuthScreen with no horizontal overflow on initial load', async ({ page }) => {
    // Navigate without auth mock
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();

    // Verify AuthScreen is rendered
    await expect(page.locator('h1:has-text("Eating Helper")')).toBeVisible();
    await expect(page.locator('button[type="button"]:has-text("Entrar")')).toBeVisible();
    await expect(page.locator('button[type="button"]:has-text("Criar Conta")')).toBeVisible();
    await expect(page.locator('button:has-text("Continuar com o Google")')).toBeVisible();

    // Verify no horizontal overflow
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);
  });

  test('should switch between Sign In and Sign Up tabs cleanly', async ({ page }) => {
    await page.goto('/');

    // Initially on sign in, confirm password is not visible
    await expect(page.locator('label:has-text("Confirmar Palavra-passe")')).not.toBeVisible();

    // Switch to Sign Up
    await page.locator('button[type="button"]:has-text("Criar Conta")').click();
    await expect(page.locator('label:has-text("Confirmar Palavra-passe")')).toBeVisible();

    // Switch back to Sign In
    await page.locator('button[type="button"]:has-text("Entrar")').click();
    await expect(page.locator('label:has-text("Confirmar Palavra-passe")')).not.toBeVisible();
  });

  test('should open ForgotPasswordModal and close cleanly without overflow', async ({ page }) => {
    await page.goto('/');

    // Open Forgot Password modal
    await page.locator('button:has-text("Esqueceu-se da palavra-passe?")').click();

    const modal = page.locator('.fixed.inset-0');
    await expect(modal).toBeVisible();
    await expect(page.locator('h3:has-text("Recuperar Palavra-passe")')).toBeVisible();

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);

    // Cancel modal
    await page.locator('button:has-text("Cancelar")').click();
    await expect(modal).not.toBeVisible();
  });

  test('should switch languages on AuthScreen and update text immediately', async ({ page }) => {
    await page.goto('/');

    // Switch to English via top-right select
    const langSelect = page.locator('select').first();
    await langSelect.selectOption('en');

    // Verify strings in English
    await expect(page.locator('button[type="button"]:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('button[type="button"]:has-text("Create Account")')).toBeVisible();
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();

    // Switch to Spanish
    await langSelect.selectOption('es');
    await expect(page.locator('button[type="button"]:has-text("Iniciar Sesión")')).toBeVisible();
    await expect(page.locator('button[type="button"]:has-text("Crear Conta"), button[type="button"]:has-text("Crear Cuenta")')).toBeVisible();
    await expect(page.locator('button:has-text("Continuar con Google")')).toBeVisible();
  });

  test('should open user profile dropdown in header and handle sign out', async ({ page }) => {
    // Inject mock user
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
    await expect(page.locator('header')).toBeVisible();

    // Click user avatar button in header
    const userBtn = page.locator('button[title*="test@example.com"]').first();
    await userBtn.click();

    // Popover opens
    await expect(page.locator('button:has-text("Terminar Sessão")')).toBeVisible();

    // Click Sign Out
    await page.locator('button:has-text("Terminar Sessão")').click();

    // Should return to AuthScreen
    await expect(page.locator('button[type="button"]:has-text("Entrar")')).toBeVisible();
    await expect(page.locator('button:has-text("Continuar com o Google")')).toBeVisible();
  });
});
