import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Mobile-Compact',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 360, height: 640 },
      },
    },
    {
      name: 'Mobile-iPhone-14',
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'Tablet-iPad',
      use: {
        viewport: { width: 810, height: 1080 },
        isMobile: false,
        hasTouch: true,
      },
    },
    {
      name: 'Desktop-Laptop',
      use: {
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'Desktop-FHD',
      use: {
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
