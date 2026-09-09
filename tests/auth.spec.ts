import { test, expect, credentials } from '../fixtures/test';

/**
 * AUTH-* : connexion. Tags : @smoke pour les P1 rejoués à chaque livraison.
 * Le titre du test devient le titre du ticket en cas d'échec : le rédiger comme un attendu.
 */
test.describe('Connexion', () => {
  test('AUTH-01 identifiants valides → accès à la liste des produits @smoke', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(credentials.user, credentials.password);
    await inventoryPage.expectLoaded();
    await inventoryPage.expectUrlContains('/inventory');
  });

  test('AUTH-02 mot de passe erroné → message d\'erreur, pas de connexion', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(credentials.user, 'mauvais-mot-de-passe');
    await loginPage.expectError(/do not match/i);
    await loginPage.expectUrlContains('^' + (process.env.BASE_URL ?? 'https://www.saucedemo.com') + '/?$');
  });

  test('AUTH-03 champs vides → le champ manquant est signalé', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submit.click();
    await loginPage.expectError(/username is required/i);
  });

  test('AUTH-04 utilisateur verrouillé → message explicite', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('locked_out_user', credentials.password);
    await loginPage.expectError(/locked out/i);
  });

  test('PERM-01 accès direct à une page protégée sans session → retour au login', async ({ page, inventoryPage }) => {
    await inventoryPage.goto();
    // saucedemo renvoie sur la racine avec un message d'erreur
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-test="error"]')).toContainText(/only access/i);
  });
});
