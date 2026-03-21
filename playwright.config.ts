import { defineConfig, devices } from '@playwright/test';
import dotenv from "dotenv";

// dotenv.config();
dotenv.config({ quiet: true });
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  workers: process.env.CI ? 1 : undefined,
  testDir: './tests',
  retries:2,
  timeout:40*1000,
  expect:{
    timeout:40*1000,
  },
  // reporter:'html',
  reporter: [
  ['line'],                 // console reporting
  ['html', { open: 'never' }],  // html reporting
   ["allure-playwright"],
],
 use: {
    baseURL: "https://qa-cart.com",   // 👈 global baseURL
    screenshot: "only-on-failure", 
    video: "retain-on-failure", 
    trace: "retain-on-failure",
    headless:false,
  },
  projects: [
    // 1) Setup project runs first
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },

    // 2) Your main tests depend on setup
    {
      name: "chromium",
      use: {
        // baseURL: "https://qa-cart.com",
        storageState: "state.json",
      },
      dependencies: ["setup"],
    },

    // Optional: add other browsers later
    // {
    //   name: "firefox",
    //   use: { baseURL: "https://qa-cart.com", storageState: "state.json" },
    //   dependencies: ["setup"],
    // },
  ],

  // use: {
  //   browserName:"chromium",
  //   headless:false,
  //   baseURL: "https://qa-cart.com",
  //   storageState: "state.json",
  // },
  //  globalSetup: require.resolve("./helpers/global-setup.ts"),

  });
