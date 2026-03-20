import { Page, Locator, expect } from "@playwright/test";

export class DemoShopPage {
  page: Page;
  shopHeading: Locator;
  searchBox: Locator;
  searchButton: Locator;
  maxPriceInput: Locator;
  productGrid: Locator;
  resultAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.shopHeading = page.getByRole("heading", { name: "DemoShop" });
    this.searchBox = page.getByRole("searchbox", { name: /search/i });
    this.searchButton = page.getByRole("button", { name: /search/i });
    this.maxPriceInput = page.getByRole("textbox", { name: /maximum price/i });
    this.productGrid = page.locator("ul.products");
    this.resultAlert = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/demoshop/");
  }

  async verifyPageLoaded() {
    await expect(this.shopHeading).toBeVisible();
  }

  async searchForProduct(keyword: string) {
    await this.searchBox.fill(keyword);
    await this.searchButton.click();
  }

  async verifySearchResultsFor(keyword: string) {
    await expect(
      this.page.getByRole("heading", {
        name: new RegExp(`search results.*${keyword}`, "i"),
      })
    ).toBeVisible();
  }

  async applyMaxPriceFilter(maxPrice: number) {
    await this.maxPriceInput.clear();
    await this.maxPriceInput.fill(String(maxPrice));
    await this.maxPriceInput.press("Enter");
  }

  async verifyPriceFilterApplied() {
    await expect(
      this.page.getByRole("button", { name: /remove price up to/i })
    ).toBeVisible();
  }

  async verifyResultsCountVisible() {
    await expect(this.resultAlert).toContainText(/\d+ results/i);
  }

  async verifyProductGridVisible() {
    await expect(this.productGrid).toBeVisible();
  }

  async getAllDisplayedPrices(): Promise<number[]> {
    const products = this.productGrid.locator(":scope > li.product");
    const count = await products.count();
    const prices: number[] = [];

    for (let i = 0; i < count; i++) {
      const priceText = await products
        .nth(i)
        .locator("span.price bdi")
        .first()
        .innerText();

      const price = parseFloat(priceText.replace("$", "").trim());
      prices.push(price);
    }

    return prices;
  }

  async verifyProductsDisplayed() {
    const products = this.productGrid.locator(":scope > li.product");
    await expect(products.first()).toBeVisible();

    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  }

  async verifyAllDisplayedPricesAreAtMost(maxPrice: number) {
    const prices = await this.getAllDisplayedPrices();

    expect(prices.length).toBeGreaterThan(0);

    for (const price of prices) {
      expect(price).toBeLessThanOrEqual(maxPrice);
    }
  }

  async getFirstProductName(): Promise<string> {
    const firstProduct = this.productGrid.locator(":scope > li.product").first();
    return (
      await firstProduct.locator(".woocommerce-loop-product__title").innerText()
    ).trim();
  }

//   async addFirstProductToCart(): Promise<string> {
//     const firstProduct = this.productGrid.locator(":scope > li.product").first();
//     const productName = (
//       await firstProduct.locator(".woocommerce-loop-product__title").innerText()
//     ).trim();

//     const addBtn = firstProduct.locator("a.add_to_cart_button");
//     await addBtn.click();

//     await expect(addBtn).not.toHaveClass(/loading/, { timeout: 15000 });
//     await expect(addBtn).toHaveClass(/added/, { timeout: 15000 });

//     return productName;
//   }


async addFirstProductToCart(): Promise<string> {
  const firstProduct = this.productGrid.locator(":scope > li.product").first();
  await expect(firstProduct).toBeVisible();

  const productName = (
    await firstProduct.locator(".woocommerce-loop-product__title").innerText()
  ).trim();

  expect(productName).toBeTruthy();

  const addBtn = firstProduct.locator("a.add_to_cart_button");
  await addBtn.click();

  await expect(addBtn).not.toHaveClass(/loading/, { timeout: 15000 });
  await expect(addBtn).toHaveClass(/added/, { timeout: 15000 });

  return productName;
}
}