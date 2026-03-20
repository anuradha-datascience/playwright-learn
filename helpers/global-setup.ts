import { chromium, FullConfig,expect } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();

async function globalSetup(config: FullConfig) {

  const baseURL = config.projects[0].use.baseURL as string;
  const storageStatePath = config.projects[0].use.storageState as string;

  const username = process.env.DEMO_USER!;
  const password = process.env.DEMO_PASS!;
  console.log("password",password)
  
  // const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const browser = await chromium.launch({ headless: false, slowMo: 300 });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(baseURL);

  await page.getByRole("textbox", { name: /username/i }).fill(username);
  await page.getByRole("textbox", { name: /password/i }).fill(password);

  await page.getByRole("button", { name: /log in/i }).click();
  console.log("URL after login:", page.url());

  await expect(page.getByRole("link", { name: /log out/i }).first()).toBeVisible();


  await context.storageState({ path: storageStatePath });

  await browser.close();
}

export default globalSetup;