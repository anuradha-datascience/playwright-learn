import { test, expect,BrowserContext  } from '@playwright/test';
let webContext: BrowserContext;

test.beforeAll(async ({ browser }) => {
    const myContext = await browser.newContext()
    const page = await myContext.newPage()
    //login
    await page.goto('https://qa-cart.com/');
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();

    await page.getByRole('textbox', { name: /username/i })
        .fill('anuradha.learn@gmail.com');
    await page.getByRole('textbox', { name: /password/i })
        .fill('Play@1234#$');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByRole('link', { name: /log out/i }).first()).toBeVisible();
    await myContext.storageState({ path: 'state.json' })
    webContext=await browser.newContext({storageState:'state.json'})
    await myContext.close();
})
test.afterAll(async () => {
  await webContext?.close();
});
test('test', async () => {

    const page=await webContext.newPage();
    await page.goto('https://qa-cart.com/');

    await page.getByRole("link", { name: "DemoShop" }).click()
    await expect(page.getByRole("heading", { name: "DemoShop" })).toBeVisible()

    await page.getByRole('searchbox', { name: /search/i })
        .fill('organic');
    await page.getByRole('button', { name: /search/i }).click();



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
    const orderId = (await (page.locator("ul.order_details>li.order strong").innerText())).trim()
    console.log(orderId)

    //finally go to my account -orders and verufy order id exists in table
    //identify row and click on view button

    // 1) Navigate to My account
    await page.getByRole("link", { name: /my account/i }).click();
    await expect(page.getByRole("heading", { name: /My account/i })).toBeVisible()

    // 2) Open Orders page
    await page.getByRole("link", { name: /^orders$/i }).first().click();
    await expect(page).toHaveURL(/orders/i);

    // 3) Wait for orders table
    const ordersTable = page.locator("table.woocommerce-orders-table");
    await expect(ordersTable).toBeVisible();

    // 4) Find the row containing the order id 


    const orderRows = ordersTable.getByRole("row")
    const countOrders = await orderRows.count()
    console.log(countOrders)
    const orderRow = orderRows.getByRole("link", { name: `View order number ${orderId}` })
    await expect(orderRow).toBeVisible()

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
    await expect(page.getByRole("heading", { name: `Order #${orderId}` })).toBeVisible()

    // 1) Navigate to My account
    await page.getByRole("link", { name: /my account/i }).click();
    await expect(page.getByRole("heading", { name: /My account/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /log out/i }).first()).toBeVisible()
    //log out
    await page.getByRole("link", { name: /log out/i }).first().click()

});
