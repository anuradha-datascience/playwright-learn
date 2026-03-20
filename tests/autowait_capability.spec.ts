import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    //login
    await page.goto('https://qa-cart.com/');
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
//  page.getByRole('textbox', { name: 'Username or email address' }).fill('anuradha.learn@gmail.com');
    //const userNameCorrect= page.getByRole('textbox', { name: 'Username or email address' })
    // await userNameCorrect.fill('anuradha.learn@gmail.com');
    //no error just with defining wrong locator
    const userNameIncorrect= page.getByRole('textbox', { name: 'Username or vmail address' })
    //error when correct action is taken

    // Test timeout of 30000ms exceeded.
    // Error: locator.fill: Test timeout of 30000ms exceeded.

    await userNameIncorrect.fill('anuradha.learn@gmail.com');
    
    
    //error-incorrect locator passed in expect
    
    // await expect(userNameIncorrect).toBeVisible();
  
    // Error: expect(locator).toBeVisible() failed

    // Locator: getByRole('textbox', { name: 'Username or vmail address' })
    // Expected: visible
    // Timeout: 5000ms
    // Error: element(s) not found

}
)
