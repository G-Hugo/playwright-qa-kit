import { test, expect } from '@playwright/test';

/**
 * API-* : exemple de tests d'API avec le client `request` de Playwright.
 * Cible de démo : https://jsonplaceholder.typicode.com. Remplacer par l'API du client.
 * Ces tests ne dépendent pas d'un navigateur : `--project=chromium` suffit pour les lancer une seule fois.
 */
const API = process.env.API_URL ?? 'https://jsonplaceholder.typicode.com';

test.describe('API de démo', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'API : un seul projet suffit');

  test('API-01 GET /posts/1 → 200 et schéma minimal', async ({ request }) => {
    const res = await request.get(`${API}/posts/1`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ id: 1, userId: expect.any(Number), title: expect.any(String) });
  });

  test('API-02 GET /posts/999999 → 404', async ({ request }) => {
    const res = await request.get(`${API}/posts/999999`);
    expect(res.status()).toBe(404);
  });

  test('API-03 POST /posts → 201 et écho du payload', async ({ request }) => {
    const payload = { title: 'QA', body: 'test', userId: 1 };
    const res = await request.post(`${API}/posts`, { data: payload });
    expect(res.status()).toBe(201);
    expect(await res.json()).toMatchObject(payload);
  });
});
