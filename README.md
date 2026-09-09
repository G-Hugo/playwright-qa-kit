# Playwright QA kit

[![E2E Playwright](https://github.com/G-Hugo/playwright-qa-kit/actions/workflows/e2e.yml/badge.svg)](https://github.com/G-Hugo/playwright-qa-kit/actions/workflows/e2e.yml)

Par [Hugo Gaveau](https://www.linkedin.com/in/hugo-gaveau-7a5409135), ingénieur QA freelance. Ce dépôt est la base que j'installe chez mes clients en mission courte, et il contient un **exemple complet de mission** dans [`examples/saucedemo/`](examples/saucedemo/) : plan de test, cas de test, 12 tickets, rapport de fin de mission en PDF, et la suite de tests correspondante (`tests/checkout.spec.ts`, avec les bugs connus annotés).


Base de tests end-to-end à cloner au début d'une mission. TypeScript, Page Objects, fixtures, rapport HTML, traces sur échec, CI GitHub Actions, et remontée automatique des échecs en tickets Jira ou Linear.

Cible de démo : [saucedemo.com](https://www.saucedemo.com). Remplacer `BASE_URL` et les Page Objects par ceux du client.

## Lancer

```bash
npm install
npx playwright install        # navigateurs (une fois)
cp .env.example .env          # puis renseigner
npm test                      # tous les projets (Chrome, Firefox, Safari, mobile)
npm run test:smoke            # seulement les @smoke, pour la régression rapide
npm test -- --project=chromium
npm run test:ui               # mode interactif
npm run report                # ouvrir le dernier rapport HTML
```

## Structure

```
pages/        Page Objects : un fichier par page, sélecteurs par rôle / label / data-test
fixtures/     test.ts : fixtures (loginPage, inventoryPage, loggedIn) et export de `test` / `expect`
tests/        *.spec.ts : un fichier par parcours, titres préfixés par l'ID du cas de test (AUTH-01…)
examples/     une mission complète, du plan de test au rapport
reporters/    issue-reporter.ts : crée un ticket Jira / Linear par test en échec
.github/      workflows/e2e.yml : CI sur push, PR, et chaque matin
```

## Ajouter un test

1. Si la page n'existe pas : créer `pages/ma-page.page.ts` qui étend `BasePage`, avec ses locators et 2-3 actions.
2. L'exposer dans `fixtures/test.ts` si elle sert dans plusieurs specs.
3. Écrire le test dans `tests/mon-parcours.spec.ts` :

```ts
import { test, expect } from '../fixtures/test';

test('CHK-01 commander un produit → page de confirmation @smoke', async ({ loggedIn, page }) => {
  await loggedIn.addToCartByName('Sauce Labs Backpack');
  await loggedIn.cartLink.click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  // ...
  await expect(page.getByRole('heading', { name: /thank you/i })).toBeVisible();
});
```

Le titre du test devient le titre du ticket en cas d'échec : l'écrire comme un attendu, avec l'ID du cas de test.

## Authentification

La fixture `loggedIn` se connecte via le formulaire à chaque test. Pour un client avec sessions longues, préférer un `globalSetup` qui se connecte une fois et sauvegarde `storageState` dans `.auth/user.json`, puis `use: { storageState: '.auth/user.json' }` dans le projet. Voir la doc Playwright « Authentication ».

## Remontée des échecs en tickets

Définir `ISSUE_TRACKER=jira` ou `linear` dans `.env` (ou dans les variables du dépôt en CI) et les identifiants correspondants. Le reporter :

- ne fait rien si `ISSUE_TRACKER` est vide ;
- ne remonte que les échecs définitifs (après retries), pas les flaky ;
- ne recrée pas un ticket dont le titre `[auto] <titre du test> [<projet>]` est déjà ouvert ;
- met dans le corps : projet, fichier, erreur, commit, chemins des traces et captures (à récupérer dans les artefacts du run).

Guides : `../02-outils/jira-setup.md` et `../02-outils/linear-setup.md`.

## CI

`e2e.yml` tourne sur push `main`, sur chaque PR, et chaque jour ouvré à 8 h. Le rapport HTML et les traces sont publiés en artefact (14 jours). Secrets à créer dans le dépôt : `TEST_USER`, `TEST_PASSWORD`, et selon l'outil `JIRA_EMAIL` + `JIRA_API_TOKEN` ou `LINEAR_API_KEY`. Variables : `BASE_URL`, `ISSUE_TRACKER`, `JIRA_BASE_URL`, `JIRA_PROJECT_KEY`, `LINEAR_TEAM_ID`, `LINEAR_LABEL_IDS`.

## Conventions

- Sélecteurs : `getByRole` > `getByLabel` / `getByPlaceholder` > `getByTestId` > CSS.
- Pas de `waitForTimeout`. Utiliser les assertions auto-attendantes (`expect(locator).toBeVisible()`).
- Un test = un parcours, indépendant des autres, rejouable seul.
- Tag `@smoke` sur les P1. Ils doivent tenir en moins de 3 minutes sur un seul navigateur.
- Données de test préfixées `qa-` et nettoyées en `afterEach` si elles persistent côté client.
