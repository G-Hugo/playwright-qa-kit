import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';

/**
 * Fixtures du kit :
 *  - loginPage, inventoryPage : Page Objects prêts à l'emploi
 *  - loggedIn : page déjà connectée avec TEST_USER / TEST_PASSWORD
 *
 * Pour un client avec auth par cookie/session, préférer `storageState`
 * (voir README, section « Authentification »).
 */
type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  loggedIn: InventoryPage;
};

// `||` et non `??` : en CI, un secret absent arrive comme chaîne vide, pas comme undefined.
export const credentials = {
  user: process.env.TEST_USER || 'standard_user',
  password: process.env.TEST_PASSWORD || 'secret_sauce',
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  loggedIn: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(credentials.user, credentials.password);
    const inventory = new InventoryPage(page);
    await inventory.expectLoaded();
    await use(inventory);
  },
});

export { expect };
