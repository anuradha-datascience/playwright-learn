import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    //login
    await page.goto('https://qa-cart.com/');
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
   
    //   await page.getByRole('textbox', { name: 'Username or email address' }).fill('anuradha.learn@gmail.com');
    //   await page.getByRole('textbox', { name: 'Password  Required' }).fill('Play@1234#$');
    //   await page.getByRole('button', { name: 'Log in' }).click();
   
    await page.getByRole('textbox', { name: /username/i })
        .fill('anuradha.learn@gmail.com');
    await page.getByRole('textbox', { name: /password/i })
        .fill('Play@1234#$');
    await page.getByRole('button', { name: /log in/i }).click();

    //Click on demoshop link
    // await page.locator('a[href*="demoshop"]').filter({ visible: true }).click();
    // await expect(page.locator(".woocommerce-products-header__title")).toHaveText("DemoShop")

    await page.getByRole("link", { name: "DemoShop" }).click()
    await expect(page.getByRole("heading", { name: "DemoShop" })).toBeVisible()

    //Search products with keyword "organic"
    // await page.getByRole('searchbox', { name: 'Search' }).click();
    // await page.getByRole('searchbox', { name: 'Search' }).fill('organic');
    // await page.getByRole('button', { name: 'Search' }).click();
    // await expect(page.locator('h1')).toContainText('Search results: “organic”');

    await page.getByRole('searchbox', { name: /search/i })
        .fill('organic');
    await page.getByRole('button', { name: /search/i }).click();

    // await expect(
    //     page.getByRole('heading', { name: "Search results: “organic”" })
    // ).toBeVisible();

    await expect(page.getByRole("heading", { name: /search results.*organic/i })
    ).toBeVisible();


// set price filter
    const maxPrice = 25;
    const maxPriceInput = page.getByRole("textbox", {
        name: /maximum price/i
    });
    await maxPriceInput.clear();
    await maxPriceInput.fill(String(maxPrice));
    await maxPriceInput.press("Enter");

    //We have already seen  setting price by slider in css filter and that would remain same

    // await page.getByLabel("Filter products by maximum price")
    //lets set max price $25 with textbox 
    // await page.getByRole("textbox",{name:"Filter products by maximum price"}).fill("$25")

    //getting by role list and filtering on basis of class
    // const productGrid = page.getByRole("list").locator(".products").first();

    // await page.waitForURL(/max_price=25/, { timeout: 15000 });
    // Wait for filter applied indicator
    await expect(
        page.getByRole("button", { name: /remove price up to/i })
    ).toBeVisible();

    await expect(
        page.getByRole("alert")
    ).toContainText(/\d+ results/i);

    //css fallback -as we want to filter by class
    const productGrid = page.locator("ul.products");
    await expect(productGrid).toBeVisible();
    console.log(await productGrid.count()); // should be 1


    //fetch the products in for loop and validate price is not greater than maxPrice 25
    // const countItems=productGrid.getByRole("listitem").count()
    // console.log(await countItems);
    // Only direct children of ul.products (actual product tiles)

    const products = productGrid.locator(":scope > li.product");
    console.log("Product tiles:", await products.count()); // should be 2
    const countItems = await products.count()

    //loop through each product and validate price is not gretaer then set in maxPrice filter
    for (let i = 0; i < countItems; i++) {
        const product = products.nth(i);
        // Fetch single price value
        const priceText = await product
            .locator("span.price bdi")
            .first()
            .innerText();
        console.log("Raw price:", priceText);
        const price = parseFloat(priceText.replace("$", ""));
        console.log("Parsed price:", price);
        expect(price).toBeLessThanOrEqual(25);
    }


    // //Select first product from search and filter results
    // await page.getByRole('button', { name: 'Add to cart: “Pulses From' }).click();

    // Get first product
    const firstProduct = products.first();

    // Fetch product name BEFORE clicking Add to Cart
    const productName = (await firstProduct
        .locator(".woocommerce-loop-product__title")
        .innerText()).trim();

    console.log("Selected Product:", productName);

    // Click Add to Cart
    await firstProduct.getByRole("button", { name: /add to cart/i })
    const addBtn = firstProduct.locator("a.add_to_cart_button"); // it's often <a>, not <button>

   await addBtn.click();
     // (Optional) ensure loading class removed
    await expect(addBtn).not.toHaveClass(/loading/, { timeout: 15000 });

 // Wait until it has class 'added' (tick state)
 await expect(addBtn).toHaveClass(/added/, { timeout: 15000 });


    // Wait for cart link to appear and click
    const cartLink = page.getByRole("link", { name: /^View Shopping Cart/i });
    await expect(cartLink).toBeVisible();

    //await cartLink.click();
   await page.goto("https://qa-cart.com/mycart/");
   await expect(page).toHaveURL(/mycart/);

    // Wait for cart rows to load
    const cartRows = page.locator("table.cart tr.cart_item");
    await expect(cartRows.first()).toBeVisible();
    const countRows = await cartRows.count();
    console.log("Cart rows count:", countRows);

    // Validate product exists in cart
    let productFound = false;
    for (let i = 0; i < countRows; i++) {
        const cartProductName = (await cartRows
            .nth(i)
            .locator("td.product-name")
            .innerText()).trim();

        console.log("Cart product:", cartProductName);
        if (cartProductName.includes(productName)) {
            productFound = true;
            break;
        }
    }

    // Assertion — ensures test fails if product not found
    expect(productFound).toBeTruthy();


//proceed to checkou
const checkoutLink = page.getByRole("link", { name: /proceed to checkout/i });
await checkoutLink.scrollIntoViewIfNeeded();
await expect(checkoutLink).toBeVisible();
await checkoutLink.click();

await expect(page).toHaveURL(/checkout/i, { timeout: 15000 });
await expect(page.getByRole("heading", { name: /checkout/i }))
  .toBeVisible({ timeout: 15000 });
await expect(page.locator("form.checkout")).toBeVisible({ timeout: 15000 });

const placeOrder = page.locator("#place_order");
await expect(placeOrder).toBeVisible({ timeout: 15000 });
await placeOrder.scrollIntoViewIfNeeded();
await placeOrder.click();


await expect(page.getByText(/your order has been received/i))
  .toBeVisible({ timeout: 15000 });
const orderId= (await (page.locator("ul.order_details>li.order strong").innerText())).trim()
console.log(orderId)
    
//finally go to my account -orders and verufy order id exists in table
//identify row and click on view button

// 1) Navigate to My account
await page.getByRole("link", { name: /my account/i }).click();
await expect(page.getByRole("heading",{name:/My account/i})).toBeVisible()

// 2) Open Orders page
await page.getByRole("link", { name: /^orders$/i }).first().click();
await expect(page).toHaveURL(/orders/i);

// 3) Wait for orders table
const ordersTable = page.locator("table.woocommerce-orders-table");
await expect(ordersTable).toBeVisible();

// 4) Find the row containing the order id 
// const orderRow = ordersTable.locator("tbody tr").filter({
//   has: page.getByRole("cell", { name: `View order number ${orderId}` })
// });

const orderRows =ordersTable.getByRole("row")
const countOrders=await orderRows.count()
console.log(countOrders)
const orderRow=orderRows.getByRole("link",{name:`View order number ${orderId}`})
await expect(orderRow).toBeVisible()
// await orderRow.click()
// await page.waitForLoadState('networkidle');
//waitfor network idle is flaaky alone - adding promiseAll
// await Promise.all([
//   page.waitForNavigation({ waitUntil: "load" }),
//   orderRow.click(),
// ]);
await orderRow.click();

await expect(page).toHaveURL(
  new RegExp(`view-order.*${orderId}`),
  { timeout: 15000 }
);

await expect(
  page.getByRole("heading", {
    name: new RegExp(`Order\\s*#${orderId}`, "i")
  })
).toBeVisible();
 await expect(page.getByRole("heading",{name:`Order #${orderId}`})).toBeVisible()

 // 1) Navigate to My account
await page.getByRole("link", { name: /my account/i }).click();
await expect(page.getByRole("heading",{name:/My account/i})).toBeVisible()
await expect(page.getByRole("link",{name:/log out/i}).first()).toBeVisible()
//log out
await page.getByRole("link",{name:/log out/i}).first().click()
// // 5) Assert the order exists
// await expect(orderRow).toHaveCount(1);

// // 6) Click View in that row
// await orderRow.getByRole("link", { name: /^view$/i }).click();

// // 7) Verify we landed on the Order details page
// await expect(page).toHaveURL(new RegExp(`view-order\\/${orderNumber}`));

// // Optional: assert the heading contains the order number
// await expect(page.getByRole("heading", { name: new RegExp(`Order\\s*#${orderId}`, "i") }))
//   .toBeVisible();

    // await expect(page.locator('tbody')).toContainText('#5616');
    // await page.getByRole('link', { name: 'View order 5616' }).click();
    // await expect(page.locator('h1')).toContainText('Order #5616');
    // await page.getByRole('link', { name: 'Account icon link' }).click();
    // await page.getByLabel('Account pages').getByRole('link', { name: 'Log out' }).click();
});