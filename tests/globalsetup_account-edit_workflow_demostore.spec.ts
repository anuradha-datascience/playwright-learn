import { test, expect, BrowserContext } from "@playwright/test";

// --------------------
// Test data / config
// --------------------
// const baseURL = "https://qa-cart.com";
// const username = "anuradha.learn@gmail.com";
// const password = "Play@1234#$";

// const storageStatePath = "state.account.json";
// let webContext: BrowserContext;

// // --------------------
// // Auth once (storageState) + reusable context
// // --------------------
// // let webContext: BrowserContext;
// test.beforeAll(async ({ browser }) => {
//   const myContext = await browser.newContext();
//   const page = await myContext.newPage();

//   await page.goto(baseURL);
//   await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();

//   await page.getByRole("textbox", { name: /username/i }).fill(username);
//   await page.getByRole("textbox", { name: /password/i }).fill(password);
//   await page.getByRole("button", { name: /log in/i }).click();

//   await expect(page.getByRole("link", { name: /log out/i }).first()).toBeVisible();

//   await myContext.storageState({ path: storageStatePath });
//   await myContext.close();
// });


// =====================================================
// Regression: Account Edit Workflow
// =====================================================
test.describe("Regression: Account Management", () => {

  test("@regression Account Edit: update fields and verify persistence", async ({page}) => {
    // const context = await browser.newContext({
    //   storageState: storageStatePath
    // });
    // const page = await context.newPage();

    await test.step("Open My Account and go to Account details", async () => {
      await page.goto("/");

      // We are already authenticated because of storageState
      await expect(page.getByRole("link", { name: /log out/i }).first()).toBeVisible();

      await page.getByRole("link", { name: "Account details", exact: true }).click();
      await expect(page).toHaveURL(/edit-account/);
    });

    await test.step("Update account fields and save changes", async () => {
      await page.getByRole("radio", { name: "Intermediate" }).check();
      await page.getByRole("checkbox", { name: "Playwright Automation" }).check();

      await page.getByRole("textbox", { name: "Preferred Start Date" }).fill("2026-04-15");

      await page.getByLabel("Preferred Automation Tool").selectOption("selenium");

      await page.getByRole("checkbox", { name: "Subscribe to AI Testing" }).check();

      await page.getByRole("button", { name: /save changes/i }).click();

      await expect(page.getByRole("alert")).toContainText(
        "Account details changed successfully."
      );
    });

    await test.step("Reload and verify values persisted", async () => {
      // Option A: reload the same page (simple and reliable)
      await page.reload();
      await expect(page).toHaveURL(/edit-account/);

      await expect(page.getByRole("radio", { name: "Intermediate" })).toBeChecked();
      await expect(page.getByRole("checkbox", { name: "Playwright Automation" })).toBeChecked();
      await expect(page.getByRole("textbox", { name: "Preferred Start Date" })).toHaveValue("2026-04-15");
      await expect(page.getByLabel("Preferred Automation Tool")).toHaveValue("selenium");
      await expect(page.getByRole("checkbox", { name: "Subscribe to AI Testing" })).toBeChecked();
    });

    // await page.close();
    // await context.close();
  });

});