import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bash -c "npm run build && npm run start"',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120000
  },
});
