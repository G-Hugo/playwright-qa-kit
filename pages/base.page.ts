import { Page, Locator, expect } from '@playwright/test';

/**
 * Classe de base des Page Objects.
 * Règles : sélecteurs par rôle / label / texte d'abord (getByRole, getByLabel),
 * data-testid ensuite, CSS en dernier recours.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract readonly path: string;

  async goto(): Promise<this> {
    await this.page.goto(this.path);
    return this;
  }

  async expectUrlContains(fragment: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(fragment));
  }

  protected byTestId(id: string): Locator {
    return this.page.getByTestId(id);
  }
}
