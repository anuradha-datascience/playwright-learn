/*Writing first test
Test App
*************
http://qa-cart.com
**********************
Test Steps
**********************
1.Go to the home page
2.Assert if the title is correct
3.Assert header text
**********************
*/

import { test, expect } from '@playwright/test'
test("Load Home Page", async ({ page }) => {

    //1.Go to the home page
    await page.goto("http://qa-cart.com")

    // 2.Assert if the title is correct
    await expect(page).toHaveTitle("QA TEST AUTOMATION DEMO STORE BY ANURADHA AGARWAL")

    // 3.Assert header text
    await expect(page.locator(".site-title:visible")).toHaveText("QA Automation Test Demo Store")

})

// test("some test name",{tag:"@smoke"},async ({page},testInfo)=>{

// })