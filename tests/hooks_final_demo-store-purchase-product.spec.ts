import { test, expect, BrowserContext } from "@playwright/test";
const dataSet=JSON.parse(
  JSON.stringify(
    require("../data/demostore_purchase_data.json")
  )
);

const baseURL = "https://qa-cart.com/";
const username = "anuradha.learn@gmail.com";
const password = "Play@1234#$";
const storageStatePath = "state.json";


// let webContext: BrowserContext;
test.beforeAll(async ({ browser }) => {
  const myContext = await browser.newContext();
  const page = await myContext.newPage();

  await page.goto(baseURL);
  await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();

  await page.getByRole("textbox", { name: /username/i }).fill(username);
  await page.getByRole("textbox", { name: /password/i }).fill(password);
  await page.getByRole("button", { name: /log in/i }).click();

  await expect(page.getByRole("link", { name: /log out/i }).first()).toBeVisible();

  await myContext.storageState({ path: storageStatePath });
  await myContext.close();
});
// test.afterAll(async () => {
//   await webContext?.close();
// });

for(const data of dataSet){
// Test data

const maxPrice = data.maxPrice;
const searchKeyword=data.searchKeyword;



test(`E2E: Search → Search=${searchKeyword} Filter → Add to Cart → Checkout → Verify Order → Logout`, async ({browser}) => {
    // Fresh authenticated context for each test
      const context = await browser.newContext({
        storageState: storageStatePath
      });
  const page = await context.newPage();

  // We'll capture these during the flow
  let productName = "";
  let orderId = "";

  await test.step("Open DemoShop", async () => {
    await page.goto(baseURL);
    await page.getByRole("link", { name: "DemoShop" }).click();
    await expect(page.getByRole("heading", { name: "DemoShop" })).toBeVisible();
  });

  await test.step(`Search for product (${searchKeyword})`, async () => {

  await page.getByRole("searchbox", { name: /search/i })
            .fill(searchKeyword);

  await page.getByRole("button", { name: /search/i })
            .click();

  await expect(page.locator("h1, h2").first()).toContainText(searchKeyword, { ignoreCase: true });
});

  await test.step(`Apply max price filter (${maxPrice}) and confirm filter applied`, async () => {
    const maxPriceInput = page.getByRole("textbox", { name: /maximum price/i });

    await maxPriceInput.clear();
    await maxPriceInput.fill(String(maxPrice));
    await maxPriceInput.press("Enter");

    await expect(page.getByRole("button", { name: /remove price up to/i })).toBeVisible();
    await expect(page.getByRole("alert")).toContainText(/\d+ results/i);
  });

  await test.step(`Validate all listed products have price <= ${maxPrice}`, async () => {
    const productGrid = page.locator("ul.products");
    await expect(productGrid).toBeVisible();

    const products = productGrid.locator(":scope > li.product");
    const countItems = await products.count();
    expect(countItems).toBeGreaterThan(0);

    for (let i = 0; i < countItems; i++) {
      const product = products.nth(i);

      const priceText = await product.locator("span.price bdi").first().innerText();
      const price = parseFloat(priceText.replace("$", "").trim());

      expect(price).toBeLessThanOrEqual(maxPrice);
    }
  });

  await test.step("Add first product to cart and capture selected product name", async () => {
    const productGrid = page.locator("ul.products");
    const products = productGrid.locator(":scope > li.product");
    const firstProduct = products.first();

    productName = (await firstProduct.locator(".woocommerce-loop-product__title").innerText()).trim();
    expect(productName).toBeTruthy();

    const addBtn = firstProduct.locator("a.add_to_cart_button");
    await addBtn.click();

    // Wait for state changes
    await expect(addBtn).not.toHaveClass(/loading/, { timeout: 15000 });
    await expect(addBtn).toHaveClass(/added/, { timeout: 15000 });

    const cartLink = page.getByRole("link", { name: /^View Shopping Cart/i });
    await expect(cartLink).toBeVisible();
  });

  await test.step("Open cart and verify selected product is present", async () => {
    await page.goto("https://qa-cart.com/mycart/");
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

  await test.step("Proceed to checkout and place the order", async () => {
    const checkoutLink = page.getByRole("link", { name: /proceed to checkout/i });
    await checkoutLink.scrollIntoViewIfNeeded();
    await expect(checkoutLink).toBeVisible();
    await checkoutLink.click();

    await expect(page).toHaveURL(/checkout/i, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible({ timeout: 15000 });
    await expect(page.locator("form.checkout")).toBeVisible({ timeout: 15000 });

    const placeOrder = page.locator("#place_order");
    await expect(placeOrder).toBeVisible({ timeout: 15000 });
    await placeOrder.scrollIntoViewIfNeeded();
    await placeOrder.click();

    await expect(page.getByText(/your order has been received/i)).toBeVisible({ timeout: 15000 });

    orderId = (await page.locator("ul.order_details>li.order strong").innerText()).trim();
    expect(orderId).toBeTruthy();
  });

  await test.step("Go to My Account → Orders and verify the order exists", async () => {
    await page.getByRole("link", { name: /my account/i }).click();
    await expect(page.getByRole("heading", { name: /my account/i })).toBeVisible();

    await page.getByRole("link", { name: /^orders$/i }).first().click();
    await expect(page).toHaveURL(/orders/i);

    const ordersTable = page.locator("table.woocommerce-orders-table");
    await expect(ordersTable).toBeVisible();

    // Find and open matching order
    const orderRowLink = ordersTable.getByRole("link", { name: `View order number ${orderId}` });
    await expect(orderRowLink).toBeVisible();
    await orderRowLink.click();

    await expect(page).toHaveURL(new RegExp(`view-order.*${orderId}`), { timeout: 15000 });

    await expect(
      page.getByRole("heading", { name: new RegExp(`Order\\s*#${orderId}`, "i") })
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: `Order #${orderId}` })).toBeVisible();
  });

  await test.step("Logout", async () => {
    await page.getByRole("link", { name: /my account/i }).click();
    await expect(page.getByRole("heading", { name: /my account/i })).toBeVisible();

    const logoutLink = page.getByRole("link", { name: /log out/i }).first();
    await expect(logoutLink).toBeVisible();
    await logoutLink.click();

    // Optional: verify we are back on login page
    await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
  });

  await page.close();
  await context.close();
})
};