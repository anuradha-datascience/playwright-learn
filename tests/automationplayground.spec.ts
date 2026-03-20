import { test, expect } from '@playwright/test';

test('Text input fields on Automation Playground', async ({ page }) => {
    await page.goto('https://www.anuradhaagarwal.com/automationplayground');

    // Fill First Name
    await page.locator('input[name="first-name"]').fill('Anuradha');

    // Optional: verify the value was entered
    await expect(page.locator('input[name="first-name"]')).toHaveValue('Anuradha');

    //Fill email field
    await page.locator("input[placeholder='example@domain.com']").fill("anuradha.learn@gmail.com")
    await expect(page.locator("input[placeholder='example@domain.com']")).toHaveValue("anuradha.learn@gmail.com")

    // Fill Textbox feedback

    // await page.locator("textarea[placeholder='How can we improve?']:visible").fill("keep working with your best..")
    // const feedback = page.locator("textarea[placeholder='How can we improve?']")
    // console.log("Feedback value:", await feedback.inputValue());
    // await expect(page.locator("textarea[placeholder='How can we improve?']")).toHaveValue("keep working with your best..")
    const feedback = page.locator("textarea[placeholder='How can we improve?']")
    await feedback.pressSequentially('Hello'); // Types instantly
    await feedback.pressSequentially('World', { delay: 100 });
    await feedback.press('Enter'); // Types slower, like a user

});

test("Select Age Range Radio Button", async ({ page }) => {

    await page.goto('https://www.anuradhaagarwal.com/automationplayground');

    // Locate Age Range radio group container
    // const ageGroup = page.locator('div[data-testid="radioGroup"] input[type="radio"]').nth(2);
    // const ageGroup=page.locator('input[type="radio"][value="Radio button2"]')
    
    // console.log(await ageGroup.count())
    // await ageGroup.check({force:true});
    await page.locator('label.wixui-radio-button-group__option', { hasText: '25-34' }).click();
    //  await page.locator('label.wixui-radio-button-group__option').nth(2).click();

    // await expect(ageGroup).toBeChecked();
    await page.pause()

});

