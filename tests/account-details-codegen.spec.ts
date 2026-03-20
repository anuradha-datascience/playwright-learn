import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  //login
  await page.getByRole('textbox', { name: 'Username or email address' }).click();
  await page.getByRole('textbox', { name: 'Username or email address' }).fill('anuradha.learn@gmail.com');
  await page.getByRole('textbox', { name: 'Password  Required' }).click();
  await page.getByRole('textbox', { name: 'Password  Required' }).fill('Play@1234#$');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByLabel('Account pages').getByRole('list')).toContainText('Account details');
 });

test('test', async ({ page }) => {
    //Load Page
  // await page.goto('https://qa-cart.com/');
  // await expect(page.locator('#ast-desktop-header')).toContainText('QA Automation Test Demo Store');
   //Go to account details
  await page.getByRole('link', { name: 'Account details', exact: true }).click();
  await page.goto('https://qa-cart.com/edit-account/');
  await page.getByRole('radio', { name: 'Intermediate' }).check();
  await page.getByRole('checkbox', { name: 'Playwright Automation' }).check();
  await page.getByRole('textbox', { name: 'Preferred Start Date' }).fill('2026-04-15');
  await page.getByLabel('Preferred Automation Tool').selectOption('selenium');
  await page.getByRole('checkbox', { name: 'Subscribe to AI Testing' }).check();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('alert')).toContainText('Account details changed successfully.');
  //check persistence
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Account details', exact: true }).click();
  await expect(page.getByText('Intermediate')).toBeVisible();
  await expect(page.locator('#post-3607')).toContainText('API Testing');
  await page.getByRole('button', { name: 'Save changes' }).click();
});

test.afterEach(async ({ page }, testInfo) => {
  console.log("account edit complete")
});