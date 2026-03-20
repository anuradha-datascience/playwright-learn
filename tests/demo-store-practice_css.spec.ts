import { test, expect } from '@playwright/test';

/******************************************* */
// Workflow 1 – Update Account Details
// Login
// Navigate to Account Details
// Update preferences using radio buttons ,checkboxes, prefered date , tool select.
// Verify changes are saved
// Logout
/******************************************* */

// test("Workflow 1: Update Account Details (CSS Selectors)", async ({ page }) => {

//   // Step 1: Login
//   await page.goto("https://qa-cart.com/");

//   await page.locator("input[name='username']")
//             .fill("anuradha.learn@gmail.com");

//   await page.locator("input[name='password']")
//             .fill("Play@1234#$");

//   await page.locator("button[name='login']").click();

//   await expect(
//     page.locator("a[href*='customer-logout']")
//   ).toBeVisible();


//   // Step 2: Navigate to Account Details
//   await page.locator(
//     ".woocommerce-MyAccount-navigation-link--edit-account a"
//   ).click();

//   await expect(
//     page.locator("h1.entry-title")
//   ).toHaveText("Account details");


//   // Step 3: Update Radio Button
//   await page.locator(
//     "input[type='radio'][name='training_level'][value='beginner']"
//   ).check();


//   // Step 4: Update Multi-choice Checkboxes
//   await page.locator(
//     "input[type='checkbox'][name='qa_interests[]'][value='playwright']"
//   ).check();

//   await page.locator(
//     "input[type='checkbox'][name='qa_interests[]'][value='ai_testing']"
//   ).check();


//   // Step 5: Update Date Field
//   const testDate = "2026-03-15";

//   await page.locator(
//     "input[type='date'][name='preferred_start_date']"
//   ).fill(testDate);


//   // Step 6: Update Dropdown Select
//   await page.locator(
//     "select[name='preferred_tool']"
//   ).selectOption("playwright");


//   // Step 7: Save Changes
//   await page.locator(
//     "button[name='save_account_details']"
//   ).click();


//   // Step 8: Verify Success Message
//   const successMessage = page.locator(
//     ".woocommerce-message"
//   );

//   await expect(successMessage).toBeVisible();

//   await expect(successMessage)
//         .toContainText("Account details changed successfully");


//   // Step 9: Verify Persistence
//   await page.locator(
//     ".woocommerce-MyAccount-navigation-link--edit-account a"
//   ).click();


//   // Verify Radio persisted
//   await expect(
//     page.locator(
//       "input[name='training_level'][value='beginner']"
//     )
//   ).toBeChecked();


//   // Verify Checkboxes persisted
//   await expect(
//     page.locator(
//       "input[name='qa_interests[]'][value='playwright']"
//     )
//   ).toBeChecked();

//   await expect(
//     page.locator(
//       "input[name='qa_interests[]'][value='ai_testing']"
//     )
//   ).toBeChecked();


//   // Verify Date persisted
//   await expect(
//     page.locator(
//       "input[name='preferred_start_date']"
//     )
//   ).toHaveValue(testDate);


//   // Verify Dropdown persisted
//   await expect(
//     page.locator(
//       "select[name='preferred_tool']"
//     )
//   ).toHaveValue("playwright");


//   // Step 10: Logout
//   await page.locator(
//     "a[href*='customer-logout']"
//   ).click();

//   await expect(
//     page.locator("button[name='login']")
//   ).toBeVisible();

// });
/******************************************* */
// Workflow 2 – Buy a Product
// Login
// Browse demoshop
//Search product -"organic"
//verify search result
//set price filter to max $25
//verify filter
// Add filtered first product to cart
// Complete checkout
// Fetch Order Id
// View Order Table and Verify order 
// Logout
/******************************************* */


test("Workflow 2: Buy a Product",async({page})=>{


  await page.goto("https://qa-cart.com");

  // Step 1: Login
  // await page.goto("https://qa-cart.com/");

  await page.locator("input[name='username']")
            .fill("anuradha.learn@gmail.com");

  await page.locator("input[name='password']")
            .fill("Play@1234#$");

  await page.locator("button[name='login']").click();

  await expect(
    page.locator("a[href*='customer-logout']")
  ).toBeVisible();
//checking the visible link

// const links = page.locator('a[href*="demoshop"]');

// for (let i = 0; i < await links.count(); i++) {
//   console.log(
//     i,
//     await links.nth(i).isVisible()
//   );
// }
//Click on demoshop link
await page.locator('a[href*="demoshop"]').filter({ visible: true }).click();
await expect(page.locator(".woocommerce-products-header__title")).toHaveText("DemoShop")
//search for "organic" 
await page.locator('input[type="search"]').fill("organic")
await page.keyboard.press('Enter');
// await page.locator('button[type="submit"][ aria-label="Search"]').click()
//verify search is successful

await expect(
  page.locator("h1.page-title")
).toContainText(/organic/i);


// // Verify products exist
//The > in ul.products > li.product is the child combinator, 
// meaning it selects only li.product elements that are direct
//  children of ul.products, making the selector more precise and reliable.

//ensures search returned results.
const products = page.locator("ul.products > li.product");
expect(await products.count()).toBeGreaterThan(0);

//get the first product
const firstProduct = products.first();

//get the title of first product 
const firstProductTitle = firstProduct.locator(
  "h2.woocommerce-loop-product__title"
);

//verify it contains word organic
await expect(firstProductTitle).toContainText(/organic/i);

//setting price filter with slider
// const minRange = page.locator("input[type='range'].wc-block-price-filter__range-input--min");
const maxRange = page.locator("input[type='range'].wc-block-price-filter__range-input--max");
// await maxRange.fill("2500");
// await minRange.fill("1500")
// const maxRange = page.locator(".wc-block-price-filter__range-input--max");

await maxRange.evaluate((el, value) => {
  const input = el as HTMLInputElement;

  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )!.set!;

  setter.call(input, String(value));

  input.dispatchEvent(new InputEvent("input", {
    bubbles: true,
    cancelable: true
  }));

}, 2500);

// wait for products to refresh
// await page.waitForLoadState("networkidle");
// await expect(page.locator(".woocommerce-result-count")).toHaveText()
await page.waitForResponse(res =>
  res.url().includes("collection-data") && res.status() === 200
);
const prices = page.locator("ul.products li.product span.price");

const count = await prices.count();
console.log(count)

for (let i = 0; i < count; i++) {
  const text = await prices.nth(i).textContent();
  const price = parseFloat(text!.replace("$", ""));
  expect(price).toBeLessThanOrEqual(25);
}

//fetch first product from the filtered product
// Step A1: Point to first product card
const firstFilteredProduct = page.locator("li.product").first();

// Step A2: Fetch product name (text)
const selectedProductName = await firstFilteredProduct
  .locator("h2.woocommerce-loop-product__title")
  .innerText();

console.log("Selected product:", selectedProductName);

//click on add to cart on first product
const addToCartBtn = firstFilteredProduct.locator("a.add_to_cart_button");
await Promise.all([
  page.waitForResponse((resp) =>
    resp.url().includes("wc-ajax=add_to_cart") && resp.status() === 200
  ),
  addToCartBtn.click()
]);


// go to cart page
const cartIcon = page.locator("a.cart-container").filter({ has: page.locator(":visible") });
await cartIcon.click();

await expect(page).toHaveURL(/mycart/);

//verify the product exists in the table
const cartRow = page.locator("tr.cart_item", { hasText: selectedProductName });
await expect(cartRow).toBeVisible();


//proceed to checkout
await (page.locator(".checkout-button")).click()
await expect(page.locator('h3[id="order_review_heading"]')).toBeVisible()

await page.locator('button[type="submit"][value="Place order"]').click()

//verify thank you page
const thankYouMessage = page.locator(
  ".woocommerce-thankyou-order-received"
);

await expect(thankYouMessage).toBeVisible();

await expect(thankYouMessage)
  .toHaveText("Thank you. Your order has been received.");

  //fetch order id
  const orderId = await page.locator(
  ".woocommerce-order-overview__order strong"
).innerText();

console.log("Order ID:", orderId);
//Verify orderid in my orders

await page.locator("a.menu-link[href*='qa-cart.com']:visible").filter({ hasText: "My account" }).click();

await page.locator('.woocommerce-MyAccount-navigation-link a[href*="/orders"]').click()
const orderRow=page.locator('.woocommerce-orders-table .woocommerce-orders-table__row',{hasText:orderId})
await expect(orderRow).toBeVisible()

//bonus - accessing a button inside the table
await orderRow.locator("a.button").click();

  // Logout
  await page.locator(
    "a[href*='customer-logout']"
  ).click();

  await expect(
    page.locator("button[name='login']")
  ).toBeVisible();

}
)
