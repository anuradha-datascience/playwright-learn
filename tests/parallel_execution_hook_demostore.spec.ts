import { test, expect, BrowserContext } from "@playwright/test";

// --------------------
// Test data / config
// --------------------
const baseURL = "https://qa-cart.com";
const username = "anuradha.learn@gmail.com";
const password = "Play@1234#$";
const maxPrice = 25;

const storageStatePath = "state.json";
let webContext: BrowserContext;

// --------------------
// Auth once (storageState) + reusable context
// --------------------
test.beforeAll(async ({ browser }) => {
  const loginContext = await browser.newContext();
  const page = await loginContext.newPage();

  await page.goto(`${baseURL}`);
  await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();

  await page.getByRole("textbox", { name: /username/i }).fill(username);
  await page.getByRole("textbox", { name: /password/i }).fill(password);
  await page.getByRole("button", { name: /log in/i }).click();

  await expect(page.getByRole("link", { name: /log out/i }).first()).toBeVisible();

  await loginContext.storageState({ path: storageStatePath });

  webContext = await browser.newContext({ storageState: storageStatePath });
  await loginContext.close();
});

test.afterAll(async () => {
  await webContext?.close();
});

// Utility: always get a fresh page per test
async function newAuthedPage() {
  return await webContext.newPage();
}

// =====================================================
// REGRESSION SUITE (Independent checks)
// Runs safely in parallel
// =====================================================
test.describe("Regression (Independent checks)", () => {
  // test.describe.configure({ mode: "parallel" });

  test("@regression Shop: DemoShop opens and search returns results", async () => {
    const page = await newAuthedPage();

    await page.goto(baseURL);

    await page.getByRole("link", { name: "DemoShop" }).click();
    await expect(page.getByRole("heading", { name: "DemoShop" })).toBeVisible();

    await page.getByRole("searchbox", { name: /search/i }).fill("organic");
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page.getByRole("heading", { name: /search results.*organic/i })).toBeVisible();
    // await page.pause();
    await page.close();
  });

  test(`@regression Filter: max price (${maxPrice}) limits product prices`, async () => {
    const page = await newAuthedPage();

    await page.goto(`${baseURL}/demoshop/`);

    await page.getByRole("searchbox", { name: /search/i }).fill("organic");
    await page.getByRole("button", { name: /search/i }).click();
    await expect(page.getByRole("heading", { name: /search results.*organic/i })).toBeVisible();

    const maxPriceInput = page.getByRole("textbox", { name: /maximum price/i });
    await maxPriceInput.clear();
    await maxPriceInput.fill(String(maxPrice));
    await maxPriceInput.press("Enter");

    await expect(page.getByRole("button", { name: /remove price up to/i })).toBeVisible();
    await expect(page.getByRole("alert")).toContainText(/\d+ results/i);

    const productGrid = page.locator("ul.products");
    await expect(productGrid).toBeVisible();

    const products = productGrid.locator(":scope > li.product");
    const count = await products.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const priceText = await products.nth(i).locator("span.price bdi").first().innerText();
      const price = parseFloat(priceText.replace("$", "").trim());
      expect(price).toBeLessThanOrEqual(maxPrice);
    }
    // await page.pause();
    await page.close();
  });

  test("@regression Cart: add first product and verify it appears in cart", async () => {
    const page = await newAuthedPage();

    await page.goto(`${baseURL}/demoshop/`);

    const productGrid = page.locator("ul.products");
    await expect(productGrid).toBeVisible();

    const firstProduct = productGrid.locator(":scope > li.product").first();
    const productName = (await firstProduct.locator(".woocommerce-loop-product__title").innerText()).trim();
    expect(productName).toBeTruthy();

    const addBtn = firstProduct.locator("a.add_to_cart_button");
    await addBtn.click();

    await expect(addBtn).not.toHaveClass(/loading/, { timeout: 15000 });
    await expect(addBtn).toHaveClass(/added/, { timeout: 15000 });

    await page.goto(`${baseURL}/mycart/`);
    await expect(page).toHaveURL(/mycart/);

    const cartRows = page.locator("table.cart tr.cart_item");
    await expect(cartRows.first()).toBeVisible();

    const countRows = await cartRows.count();
    expect(countRows).toBeGreaterThan(0);

    let found = false;
    for (let i = 0; i < countRows; i++) {
      const cartProductName = (await cartRows.nth(i).locator("td.product-name").innerText()).trim();
      if (cartProductName.includes(productName)) {
        found = true;
        break;
      }
    }
    expect(found).toBeTruthy();
    // await page.pause();
    await page.close();
  });
});

// =====================================================
// SMOKE SUITE (Complete workflow)
// Runs serially to keep business journey stable
// =====================================================
test.describe.serial("Smoke (Complete purchase workflow)", () => {
  test("@smoke E2E: Shop → Cart → Checkout → Verify Order", async () => {
    const page = await newAuthedPage();

    let productName = "";
    let orderId = "";

    await test.step("Open shop and add first product to cart", async () => {
      await page.goto(`${baseURL}/demoshop/`);


      const productGrid = page.locator("ul.products");
      await expect(productGrid).toBeVisible();

      const firstProduct = productGrid.locator(":scope > li.product").first();
      productName = (await firstProduct.locator(".woocommerce-loop-product__title").innerText()).trim();
      expect(productName).toBeTruthy();

      const addBtn = firstProduct.locator("a.add_to_cart_button");
      await addBtn.click();

      await expect(addBtn).not.toHaveClass(/loading/, { timeout: 15000 });
      await expect(addBtn).toHaveClass(/added/, { timeout: 15000 });
    });

    await test.step("Validate product exists in cart", async () => {
      await page.goto(`${baseURL}/mycart/`);
      await expect(page).toHaveURL(/mycart/);

      const cartRows = page.locator("table.cart tr.cart_item");
      await expect(cartRows.first()).toBeVisible();

      const countRows = await cartRows.count();
      expect(countRows).toBeGreaterThan(0);

      let productFound = false;
      for (let i = 0; i < countRows; i++) {
        const cartProductName = (await cartRows.nth(i).locator("td.product-name").innerText()).trim();
        if (cartProductName.includes(productName)) {
          productFound = true;
          break;
        }
      }
      expect(productFound).toBeTruthy();
    });

    await test.step("Checkout and place the order", async () => {
      const checkoutLink = page.getByRole("link", { name: /proceed to checkout/i });
      await checkoutLink.scrollIntoViewIfNeeded();
      await checkoutLink.click();

      await expect(page).toHaveURL(/checkout/i, { timeout: 15000 });

      const placeOrder = page.locator("#place_order");
      await expect(placeOrder).toBeVisible({ timeout: 15000 });
      await placeOrder.scrollIntoViewIfNeeded();
      await placeOrder.click();

      await expect(page.getByText(/your order has been received/i)).toBeVisible({ timeout: 15000 });

      orderId = (await page.locator("ul.order_details>li.order strong").innerText()).trim();
      expect(orderId).toBeTruthy();
    });

    await test.step("Verify order appears in My Account → Orders", async () => {
      await page.goto(`${baseURL}/`);
      await expect(page.getByRole("heading", { name: /my account/i })).toBeVisible();

      await page.getByRole("link", { name: /^orders$/i }).first().click();
      await expect(page).toHaveURL(/orders/i);

      const ordersTable = page.locator("table.woocommerce-orders-table");
      await expect(ordersTable).toBeVisible();

      const orderLink = ordersTable.getByRole("link", { name: `View order number ${orderId}` });
      await expect(orderLink).toBeVisible();
      await orderLink.click();

      await expect(page).toHaveURL(new RegExp(`view-order.*${orderId}`), { timeout: 15000 });
      await expect(page.getByRole("heading", { name: new RegExp(`Order\\s*#${orderId}`, "i") })).toBeVisible();
    });

    await page.close();
  });
});