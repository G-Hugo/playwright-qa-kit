import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/** Liste des produits après connexion (saucedemo). */
export class InventoryPage extends BasePage {
  readonly path = '/inventory.html';
  readonly title: Locator;
  readonly items: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('.title');
    this.items = page.locator('[data-test="inventory-item"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.title).toHaveText('Products');
    await expect(this.items.first()).toBeVisible();
  }

  async addToCartByName(name: string): Promise<void> {
    const item = this.items.filter({ hasText: name });
    await item.getByRole('button', { name: /add to cart/i }).click();
  }

  async expectCartCount(n: number): Promise<void> {
    await expect(this.cartBadge).toHaveText(String(n));
  }
}
