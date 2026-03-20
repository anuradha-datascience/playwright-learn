import { Page, Locator, expect } from "@playwright/test";

export class HomePage {
  page: Page;
  demoShopLink: Locator;
  myAccountHeading: Locator;
  ordersLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.demoShopLink = page.getByRole("link", { name: "DemoShop" });
    this.myAccountHeading = page.getByRole("heading", { name: /my account/i });
    this.ordersLink = page.getByRole("link", { name: /^orders$/i }).first();
  }

  async goto() {
    await this.page.goto("/");
  }

  async openDemoShop() {
    await this.demoShopLink.click();
  }

  async verifyMyAccountPageLoaded() {
    await expect(this.myAccountHeading).toBeVisible();
  }

  async openOrders() {
    await this.ordersLink.click();
  }
}