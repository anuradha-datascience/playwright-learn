import { Page, Locator, expect } from "@playwright/test";

export class OrdersPage {
  page: Page;
  ordersTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.ordersTable = page.locator("table.woocommerce-orders-table");
  }

  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/orders/i);
    await expect(this.ordersTable).toBeVisible();
  }

  async openOrderById(orderId: string) {
    const orderLink = this.ordersTable.getByRole("link", {
      name: `View order number ${orderId}`,
    });

    await expect(orderLink).toBeVisible();
    await orderLink.click();
  }

  async verifyOrderDetailsPage(orderId: string) {
    await expect(this.page).toHaveURL(new RegExp(`view-order.*${orderId}`), {
      timeout: 15000,
    });

    await expect(
      this.page.getByRole("heading", {
        name: new RegExp(`Order\\s*#${orderId}`, "i"),
      })
    ).toBeVisible();
  }
}