import { test } from "@playwright/test";
import { cleanArtifacts } from "../helpers/cleanup";
import { LoginPage } from "../pages/LoginPage";

test("global setup: clean reports and create authenticated session", async ({ page }) => {
  cleanArtifacts();

  const storageStatePath = "state.json";
  // const username = process.env.DEMO_USER;
  // const password = process.env.DEMO_PASS;
  const username = process.env.DEMO_USERNAME;
  const password = process.env.DEMO_PASS;

  if (!username || !password) {
    throw new Error("Missing DEMO_USER or DEMO_PASS in .env file");
  }

  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.verifyPageLoaded();
  await loginPage.login(username, password);
  await loginPage.verifyLoginSuccessful();

  await page.context().storageState({ path: storageStatePath });
});