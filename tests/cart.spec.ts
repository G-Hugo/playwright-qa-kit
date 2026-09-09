import { test, expect } from '../fixtures/test';

/** CART-* : parcours d'achat, utilise la fixture `loggedIn`. */
test.describe('Panier', () => {
  test('CART-01 ajouter un produit → le compteur du panier passe à 1 @smoke', async ({ loggedIn }) => {
    await loggedIn.addToCartByName('Sauce Labs Backpack');
    await loggedIn.expectCartCount(1);
  });

  test('CART-02 ajouter deux produits → le panier liste les deux', async ({ loggedIn, page }) => {
    await loggedIn.addToCartByName('Sauce Labs Backpack');
    await loggedIn.addToCartByName('Sauce Labs Bike Light');
    await loggedIn.expectCartCount(2);
    await loggedIn.cartLink.click();
    await expect(page).toHaveURL(/cart/);
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(2);
  });

  test('CART-03 retirer un produit depuis le panier → compteur mis à jour', async ({ loggedIn, page }) => {
    await loggedIn.addToCartByName('Sauce Labs Backpack');
    await loggedIn.cartLink.click();
    await page.getByRole('button', { name: /remove/i }).click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
    await expect(loggedIn.cartBadge).toHaveCount(0);
  });
});
