import { test } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { DemoShopPage } from "../pages/DemoShopPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { OrdersPage } from "../pages/OrdersPage";

const dataSet = JSON.parse(
  JSON.stringify(
    require("../data/demostore_purchase_data.json")
  )
);

const maxPrice = dataSet[0].maxPrice;
const searchKeyword = dataSet[0].searchKeyword;

test("@regression Shop: DemoShop opens and search returns results", async ({ page }) => {
  const homePage = new HomePage(page);
  const demoShopPage = new DemoShopPage(page);

  await homePage.goto();
  await homePage.openDemoShop();
  await demoShopPage.verifyPageLoaded();
  await demoShopPage.searchForProduct("organic");
  await demoShopPage.verifySearchResultsFor("organic");
});


test(`@regression Filter: max price (${maxPrice}) limits product prices`, async ({ page }) => {
  const demoShopPage = new DemoShopPage(page);

  await demoShopPage.goto();
  await demoShopPage.searchForProduct("organic");
  await demoShopPage.verifySearchResultsFor("organic");
  await demoShopPage.applyMaxPriceFilter(maxPrice);
  await demoShopPage.verifyPriceFilterApplied();
  await demoShopPage.verifyResultsCountVisible();
  await demoShopPage.verifyProductGridVisible();
  await demoShopPage.verifyProductsDisplayed();
  await demoShopPage.verifyAllDisplayedPricesAreAtMost(maxPrice);
});



test("@regression Cart: add first product and verify it appears in cart", async ({ page }) => {
  const demoShopPage = new DemoShopPage(page);
  const cartPage = new CartPage(page);

  await demoShopPage.goto();
  await demoShopPage.verifyProductGridVisible();

  const productName = await demoShopPage.addFirstProductToCart();

  await cartPage.goto();
  await cartPage.verifyPageLoaded();
  await cartPage.verifyCartHasItems();
  await cartPage.verifyProductPresent(productName);
});




test("@smoke @regression E2E: Shop → Cart → Checkout → Verify Order", async ({ page }) => {
  const demoShopPage = new DemoShopPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const homePage = new HomePage(page);
  const ordersPage = new OrdersPage(page);

  let productName = "";
  let orderId = "";

  await test.step("Open shop and add first product to cart", async () => {
    await demoShopPage.goto();
    await demoShopPage.verifyProductGridVisible();
    productName = await demoShopPage.addFirstProductToCart();
  });

  await test.step("Validate product exists in cart", async () => {
    await cartPage.goto();
    await cartPage.verifyPageLoaded();
    await cartPage.verifyCartHasItems();
    await cartPage.verifyProductPresent(productName);
  });

  await test.step("Checkout and place the order", async () => {
    await cartPage.proceedToCheckout();
    await checkoutPage.verifyPageLoaded();
    orderId = await checkoutPage.placeOrder();
  });

  await test.step("Verify order appears in My Account → Orders", async () => {
    await homePage.goto();
    await homePage.verifyMyAccountPageLoaded();
    await homePage.openOrders();

    await ordersPage.verifyPageLoaded();
    await ordersPage.openOrderById(orderId);
    await ordersPage.verifyOrderDetailsPage(orderId);
  });
});