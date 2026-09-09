// Session exploratoire 1 — saucedemo.com — charte : parcours d'achat, validation des formulaires, permissions, comptes à problème.
// Lance : node session-1.js  (depuis missions/2026-09-saucedemo/explo ; utilise le Playwright du kit)
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(__dirname, '..', '..', '..', 'node_modules', 'playwright'));
const BASE = 'https://www.saucedemo.com';
const PASS = 'secret_sauce';
const shots = path.join(__dirname, '..', 'tickets', 'captures');
fs.mkdirSync(shots, { recursive: true });
const R = [];
const note = (id, ok, detail) => { R.push({ id, ok, detail }); console.log((ok ? 'OK  ' : 'KO  ') + id + ' — ' + detail); };

async function login(page, user) {
  await page.goto(BASE + '/');
  await page.fill('[data-test="username"]', user);
  await page.fill('[data-test="password"]', PASS);
  const t0 = Date.now();
  await page.click('[data-test="login-button"]');
  await page.waitForLoadState('networkidle');
  return Date.now() - t0;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'fr-FR' });
  const page = await ctx.newPage();
  const jsErrors = [];
  page.on('pageerror', (e) => jsErrors.push(e.message));
  page.on('dialog', async (d) => { R.push({ id: 'DIALOG', ok: true, detail: d.message() }); await d.dismiss(); });

  // 1. Checkout avec panier vide
  await login(page, 'standard_user');
  await page.goto(BASE + '/checkout-step-one.html');
  await page.fill('[data-test="firstName"]', 'QA'); await page.fill('[data-test="lastName"]', 'Test'); await page.fill('[data-test="postalCode"]', '35000');
  await page.click('[data-test="continue"]');
  const overviewItems = await page.locator('[data-test="inventory-item"]').count();
  await page.click('[data-test="finish"]');
  const thanks = await page.locator('[data-test="complete-header"]').textContent().catch(() => null);
  note('CHK-EMPTY', !(overviewItems === 0 && thanks), `panier vide : ${overviewItems} article(s) à l'étape 2, page finale = "${thanks}"`);
  if (overviewItems === 0 && thanks) await page.screenshot({ path: path.join(shots, 'chk-empty-thank-you.png') });

  // 2. Validation du formulaire de livraison
  await page.goto(BASE + '/checkout-step-one.html');
  await page.click('[data-test="continue"]');
  const e1 = await page.locator('[data-test="error"]').textContent();
  await page.fill('[data-test="firstName"]', 'QA'); await page.click('[data-test="continue"]');
  const e2 = await page.locator('[data-test="error"]').textContent();
  await page.fill('[data-test="lastName"]', 'Test'); await page.fill('[data-test="postalCode"]', 'abc!!'); await page.click('[data-test="continue"]');
  const acceptedPostal = page.url().includes('step-two');
  note('CHK-VALID', true, `vide → "${e1}" ; sans nom → "${e2}" ; code postal "abc!!" accepté = ${acceptedPostal}`);
  if (acceptedPostal) { await page.goBack(); await page.screenshot({ path: path.join(shots, 'chk-postal-letters.png') }); }

  // 2b. Espaces seuls dans les champs
  await page.goto(BASE + '/checkout-step-one.html');
  await page.fill('[data-test="firstName"]', '   '); await page.fill('[data-test="lastName"]', '   '); await page.fill('[data-test="postalCode"]', '   ');
  await page.click('[data-test="continue"]');
  note('CHK-SPACES', !page.url().includes('step-two'), `champs remplis d'espaces acceptés = ${page.url().includes('step-two')}`);

  // 3. Totaux
  await page.goto(BASE + '/inventory.html');
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
  await page.goto(BASE + '/checkout-step-one.html');
  await page.fill('[data-test="firstName"]', 'QA'); await page.fill('[data-test="lastName"]', 'Test'); await page.fill('[data-test="postalCode"]', '35000');
  await page.click('[data-test="continue"]');
  const prices = await page.locator('[data-test="inventory-item-price"]').allTextContents();
  const sub = await page.locator('[data-test="subtotal-label"]').textContent();
  const tax = await page.locator('[data-test="tax-label"]').textContent();
  const tot = await page.locator('[data-test="total-label"]').textContent();
  const sum = prices.reduce((s, p) => s + parseFloat(p.replace('$', '')), 0);
  note('CHK-TOTALS', true, `prix ${prices.join(' + ')} = ${sum.toFixed(2)} ; ${sub} ; ${tax} ; ${tot}`);

  // 4. XSS dans le prénom
  await page.goto(BASE + '/checkout-step-one.html');
  await page.fill('[data-test="firstName"]', '<img src=x onerror="window.__xss=1">'); await page.fill('[data-test="lastName"]', 'Test'); await page.fill('[data-test="postalCode"]', '35000');
  await page.click('[data-test="continue"]');
  const xss = await page.evaluate(() => window.__xss === 1);
  note('SEC-XSS', !xss, `payload exécuté = ${xss} (le prénom n'est pas réaffiché, à confirmer)`);

  // 5. Reset App State
  await page.goto(BASE + '/inventory.html');
  if (await page.locator('[data-test="remove-sauce-labs-backpack"]').count()) await page.click('[data-test="remove-sauce-labs-backpack"]');
  if (await page.locator('[data-test="remove-sauce-labs-bike-light"]').count()) await page.click('[data-test="remove-sauce-labs-bike-light"]');
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('#react-burger-menu-btn'); await page.click('#reset_sidebar_link'); await page.click('#react-burger-cross-btn');
  const badge = await page.locator('[data-test="shopping-cart-badge"]').count();
  const btn = await page.locator('[data-test="remove-sauce-labs-backpack"]').count();
  note('RESET-STATE', !(badge === 0 && btn === 1), `après reset : badge=${badge}, bouton "Remove" encore affiché=${btn === 1}`);
  if (badge === 0 && btn === 1) await page.screenshot({ path: path.join(shots, 'reset-remove-button.png') });

  // 6. Panier persistant après rechargement
  await page.goto(BASE + '/inventory.html');
  if (await page.locator('[data-test="remove-sauce-labs-backpack"]').count()) await page.click('[data-test="remove-sauce-labs-backpack"]');
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]'); await page.reload();
  note('CART-RELOAD', (await page.locator('[data-test="shopping-cart-badge"]').textContent()) === '1', 'badge après reload');

  // 7. Retour arrière après déconnexion
  await page.click('#react-burger-menu-btn'); await page.click('#logout_sidebar_link');
  await page.goBack(); await page.waitForTimeout(500);
  const afterBack = page.url() + ' | ' + ((await page.locator('[data-test="error"]').textContent().catch(() => '')) || 'aucun message');
  note('AUTH-BACK', !page.url().includes('inventory') || afterBack.includes('access'), `après logout + retour : ${afterBack}`);

  // 8. Accès direct sans session
  for (const p of ['/checkout-complete.html', '/cart.html', '/checkout-step-two.html']) {
    await page.goto(BASE + p);
    const msg = await page.locator('[data-test="error"]').textContent().catch(() => '');
    note('PERM-' + p, /only access/i.test(msg), `${p} → ${page.url().replace(BASE, '')} "${msg}"`);
  }

  // 9. Article inexistant
  await login(page, 'standard_user');
  await page.goto(BASE + '/inventory-item.html?id=999');
  note('ITEM-404', true, `id=999 → nom="${await page.locator('[data-test="inventory-item-name"]').textContent().catch(() => '?')}", prix="${await page.locator('[data-test="inventory-item-price"]').textContent().catch(() => '?')}"`);
  await page.screenshot({ path: path.join(shots, 'item-999.png') });

  // 10. Liens du footer
  await page.goto(BASE + '/inventory.html');
  const links = await page.locator('footer a').evaluateAll((as) => as.map((a) => `${a.textContent.trim()}:${a.target}:${a.rel || 'norel'}`));
  note('FOOT-LINKS', links.every((l) => /noopener|noreferrer/.test(l)), links.join(' | '));

  // 11. Tri par prix
  await page.selectOption('[data-test="product-sort-container"]', 'lohi');
  const sorted = (await page.locator('[data-test="inventory-item-price"]').allTextContents()).map((p) => parseFloat(p.slice(1)));
  note('SORT-PRICE', sorted.every((v, i) => i === 0 || v >= sorted[i - 1]), sorted.join(' '));

  // 12. Mobile : débordement horizontal
  const mob = await browser.newContext({ ...require(path.join(__dirname, '..', '..', '..', 'node_modules', 'playwright')).devices['iPhone 14'] });
  const mp = await mob.newPage();
  await login(mp, 'standard_user');
  const over = await mp.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  note('MOB-OVERFLOW', over.sw <= over.iw, `scrollWidth ${over.sw} / innerWidth ${over.iw}`);
  await mp.click('[data-test="add-to-cart-sauce-labs-backpack"]'); await mp.click('[data-test="shopping-cart-link"]'); await mp.click('[data-test="checkout"]');
  await mp.screenshot({ path: path.join(shots, 'mobile-checkout.png') });
  await mob.close();

  // 13. Comptes à problème
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p2 = await ctx2.newPage();
  const err2 = []; p2.on('pageerror', (e) => err2.push(e.message));
  p2.on('dialog', async (d) => { R.push({ id: 'DIALOG-error_user', ok: false, detail: d.message() }); await d.dismiss(); });
  const t = await login(p2, 'performance_glitch_user');
  note('PERF-LOGIN', t < 3000, `connexion performance_glitch_user en ${t} ms`);

  await p2.goto(BASE + '/'); await p2.context().clearCookies();
  await login(p2, 'problem_user');
  const imgs = await p2.locator('[data-test="inventory-item"] img').evaluateAll((im) => [...new Set(im.map((i) => i.getAttribute('src')))]);
  note('PROB-IMAGES', imgs.length > 1, `${imgs.length} image(s) distincte(s) pour 6 produits : ${imgs.join(', ')}`);
  if (imgs.length === 1) await p2.screenshot({ path: path.join(shots, 'problem-user-images.png') });
  await p2.click('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').catch(() => {});
  const probBadge = await p2.locator('[data-test="shopping-cart-badge"]').textContent().catch(() => '0');
  note('PROB-ADD', probBadge === '1', `problem_user ajoute la Fleece Jacket → badge=${probBadge}`);
  await p2.goto(BASE + '/checkout-step-one.html');
  await p2.fill('[data-test="lastName"]', 'Dupont');
  const lastVal = await p2.inputValue('[data-test="lastName"]');
  note('PROB-LASTNAME', lastVal === 'Dupont', `problem_user saisit "Dupont" dans Nom → valeur="${lastVal}"`);
  if (lastVal !== 'Dupont') await p2.screenshot({ path: path.join(shots, 'problem-user-lastname.png') });

  await p2.context().clearCookies();
  await login(p2, 'error_user');
  await p2.selectOption('[data-test="product-sort-container"]', 'lohi').catch(() => {});
  await p2.waitForTimeout(300);
  await p2.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await p2.click('[data-test="remove-sauce-labs-backpack"]').catch(() => {});
  const errBadge = await p2.locator('[data-test="shopping-cart-badge"]').textContent().catch(() => '0');
  note('ERR-REMOVE', errBadge === '0', `error_user retire le Backpack → badge=${errBadge}`);
  await p2.goto(BASE + '/checkout-step-one.html');
  await p2.fill('[data-test="firstName"]', 'QA'); await p2.fill('[data-test="lastName"]', 'Test'); await p2.fill('[data-test="postalCode"]', '35000');
  await p2.click('[data-test="continue"]'); await p2.click('[data-test="finish"]'); await p2.waitForTimeout(500);
  note('ERR-FINISH', p2.url().includes('complete'), `error_user clique Finish → ${p2.url().replace(BASE, '')} ; erreurs JS : ${err2.slice(-2).join(' / ') || 'aucune'}`);
  if (!p2.url().includes('complete')) await p2.screenshot({ path: path.join(shots, 'error-user-finish.png') });

  await p2.context().clearCookies();
  await login(p2, 'locked_out_user');
  note('AUTH-LOCKED', true, `locked_out_user → "${await p2.locator('[data-test="error"]').textContent()}"`);

  note('JS-ERRORS-standard', jsErrors.length === 0, jsErrors.join(' / ') || 'aucune erreur JS avec standard_user');
  fs.writeFileSync(path.join(__dirname, 'session-1-resultats.json'), JSON.stringify(R, null, 2));
  await browser.close();
})();
