import { test, expect } from '../fixtures/test';
import { CheckoutPage } from '../pages/checkout.page';
import { LoginPage } from '../pages/login.page';

/**
 * CHK-* : tunnel de commande. Les tests marqués `test.fail` documentent un bug connu (ticket SD-xx) :
 * ils sont attendus en échec aujourd'hui, et Playwright signalera le jour où ils passent, c'est-à-dire
 * le jour où le bug est corrigé. On retire alors l'annotation et le test devient une non-régression.
 */
test.describe('Tunnel de commande', () => {
  test('CHK-01 commande complète d\'un article → confirmation @smoke', async ({ loggedIn, page }) => {
    await loggedIn.addToCartByName('Sauce Labs Backpack');
    await loggedIn.cartLink.click();
    await page.locator('[data-test="checkout"]').click();
    const checkout = new CheckoutPage(page);
    await checkout.fillInfo('QA', 'Test', '35000');
    await checkout.expectOverview();
    await expect(checkout.items).toHaveCount(1);
    await checkout.finishBtn.click();
    await checkout.expectComplete();
  });

  test('CHK-02 récapitulatif : sous-total, taxe 8 % et total cohérents @smoke', async ({ loggedIn, page }) => {
    await loggedIn.addToCartByName('Sauce Labs Backpack');
    await loggedIn.addToCartByName('Sauce Labs Bike Light');
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await checkout.fillInfo('QA', 'Test', '35000');
    await checkout.expectOverview();
    const prices = (await page.locator('[data-test="inventory-item-price"]').allTextContents()).map((p) => parseFloat(p.slice(1)));
    const sum = prices.reduce((a, b) => a + b, 0);
    const tax = Math.round(sum * 8) / 100;
    await expect(checkout.subtotal).toHaveText(`Item total: $${sum.toFixed(2)}`);
    await expect(checkout.tax).toHaveText(`Tax: $${tax.toFixed(2)}`);
    await expect(checkout.total).toHaveText(`Total: $${(sum + tax).toFixed(2)}`);
  });

  test('CHK-03 champs obligatoires vides → le champ manquant est signalé', async ({ loggedIn, page }) => {
    await loggedIn.addToCartByName('Sauce Labs Backpack');
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await checkout.continueBtn.click();
    await expect(checkout.error).toContainText(/first name is required/i);
    await checkout.firstName.fill('QA');
    await checkout.continueBtn.click();
    await expect(checkout.error).toContainText(/last name is required/i);
  });

  test('CHK-04 panier vide → la commande doit être refusée', async ({ loggedIn, page }) => {
    test.fail(true, 'Bug connu SD-01 : la commande est confirmée avec un panier vide');
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await checkout.fillInfo('QA', 'Test', '35000');
    // Attendu : on n'atteint pas le récapitulatif, ou il n'y a pas de bouton Finish actif
    await expect(page).not.toHaveURL(/checkout-step-two/);
  });

  test('CHK-05 champs remplis d\'espaces → refusés comme des champs vides', async ({ loggedIn, page }) => {
    test.fail(true, 'Bug connu SD-09 : des espaces seuls passent la validation');
    await loggedIn.addToCartByName('Sauce Labs Backpack');
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await checkout.fillInfo('   ', '   ', '   ');
    await expect(checkout.error).toContainText(/required/i);
  });
});

test.describe('Profils signalés par le support', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Profils : un seul navigateur suffit');

  test('PROF-01 problem_user peut saisir son nom à la livraison', async ({ page }) => {
    test.fail(true, 'Bug connu SD-02 : le champ Nom refuse la saisie pour problem_user');
    const login = new LoginPage(page);
    await login.goto();
    await login.login('problem_user', 'secret_sauce');
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await checkout.lastName.fill('Dupont');
    await expect(checkout.lastName).toHaveValue('Dupont');
  });

  test('PROF-03 error_user peut finaliser une commande', async ({ page }) => {
    test.fail(true, 'Bug connu SD-03 : Finish ne fait rien pour error_user');
    const login = new LoginPage(page);
    await login.goto();
    await login.login('error_user', 'secret_sauce');
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await checkout.fillInfo('QA', 'Test', '35000');
    await checkout.finishBtn.click();
    await checkout.expectComplete();
  });
});
