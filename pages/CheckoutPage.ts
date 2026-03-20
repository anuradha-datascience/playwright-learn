import { Page, Locator, expect } from "@playwright/test";

export class CheckoutPage {
  page: Page;
  placeOrderButton: Locator;
  orderReceivedMessage: Locator;
  orderNumber: Locator;

  constructor(page: Page) {
    this.page = page;
    this.placeOrderButton = page.locator("#place_order");
    this.orderReceivedMessage = page.getByText(/your order has been received/i);
    this.orderNumber = page.locator("ul.order_details > li.order strong");
  }

  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/checkout/i, { timeout: 15000 });
    await expect(this.placeOrderButton).toBeVisible({ timeout: 15000 });
  }

  async placeOrder(): Promise<string> {
    await this.placeOrderButton.scrollIntoViewIfNeeded();
    await this.placeOrderButton.click();

    await expect(this.orderReceivedMessage).toBeVisible({ timeout: 15000 });

    const orderId = (await this.orderNumber.innerText()).trim();
    expect(orderId).toBeTruthy();

    return orderId;
  }
}