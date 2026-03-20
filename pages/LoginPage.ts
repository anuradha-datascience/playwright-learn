import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  page: Page;
  loginHeading: Locator;
  usernameInput: Locator;
  passwordInput: Locator;
  loginButton: Locator;
  logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginHeading = page.getByRole("heading", { name: /login/i });
    this.usernameInput = page.locator("input[name='username']");
    this.passwordInput = page.locator("input[name='password']");
    this.loginButton = page.getByRole("button", { name: /log in/i });
    this.logoutLink = page.getByRole("link", { name: /log out|logout/i }).first();
  }

  async goto() {
    await this.page.goto("/");
  }

  async verifyPageLoaded() {
    await expect(this.loginHeading).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async verifyLoginSuccessful() {
    await this.page.goto("/");
    await expect(this.logoutLink).toBeVisible();
  }
}