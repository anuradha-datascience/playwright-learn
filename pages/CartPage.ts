import { Page, Locator, expect } from "@playwright/test";

export class CartPage {
  page: Page;
  cartRows: Locator;
  checkoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartRows = page.locator("table.cart tr.cart_item");
    this.checkoutLink = page.getByRole("link", { name: /proceed to checkout/i });
  }

  async goto() {
    await this.page.goto("/mycart/");
  }

  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/mycart/);
    await expect(this.cartRows.first()).toBeVisible();
  }

  async verifyCartHasItems() {
    const countRows = await this.cartRows.count();
    expect(countRows).toBeGreaterThan(0);
  }

  async isProductPresent(productName: string): Promise<boolean> {
    const countRows = await this.cartRows.count();

    for (let i = 0; i < countRows; i++) {
      const cartProductName = (
        await this.cartRows.nth(i).locator("td.product-name").innerText()
      ).trim();

      if (cartProductName.includes(productName)) {
        return true;
      }
    }

    return false;
  }

  async verifyProductPresent(productName: string) {
    const found = await this.isProductPresent(productName);
    expect(found).toBeTruthy();
  }

  async proceedToCheckout() {
    await this.checkoutLink.scrollIntoViewIfNeeded();
    await this.checkoutLink.click();
  }
}