# Tickets — Swag Labs · saucedemo.com

Format Linear, un ticket par anomalie, préfixe SD. Captures dans `captures/`. Environnement : https://www.saucedemo.com, Chromium 140 / Windows 11, 2 septembre 2026. Tous les tickets sont reproduits au moins deux fois, et une seconde fois par la suite Playwright quand indiqué.

---

## SD-01 · [Commande] Panier vide → la commande est confirmée quand même

**Sévérité** : Critique · **Priorité suggérée** : P1 · **Cas de test** : CHK-04 · **Labels** : qa, qa-mission-2026-09, regression-candidate
**Compte** : standard_user · **Fréquence** : systématique · **Multi-navigateurs** : reproduit sur Chromium, Firefox, WebKit, iPhone 14, Pixel 7

**Étapes**
1. Se connecter avec standard_user, ne rien ajouter au panier
2. Ouvrir directement https://www.saucedemo.com/checkout-step-one.html
3. Saisir QA / Test / 35000, cliquer Continue
4. Sur le récapitulatif (aucun article listé, Item total $0.00), cliquer Finish

**Obtenu**
Page « Thank you for your order! » affichée. Une commande sans aucun article est acceptée.

**Attendu**
Le tunnel refuse de continuer avec un panier vide : bouton Checkout désactivé dans le panier, et accès direct à l'étape 1 redirigé vers le panier avec un message.

**Pièces jointes** : `captures/chk-empty-thank-you.png`

**Notes** : le bouton Checkout est également actif dans la page panier vide. Vérifier côté serveur, pas seulement dans l'interface.

---

## SD-02 · [Commande] problem_user → le champ Nom refuse toute saisie, commande impossible

**Sévérité** : Bloquant · **Priorité suggérée** : P1 · **Cas de test** : PROF-01 · **Labels** : qa, qa-mission-2026-09, profil-problem_user
**Compte** : problem_user · **Fréquence** : systématique

**Étapes**
1. Se connecter avec problem_user
2. Ajouter un produit, aller au panier, cliquer Checkout
3. Dans le champ Last Name, taper « Dupont »

**Obtenu**
Le champ reste vide quelle que soit la saisie. Continue renvoie « Error: Last Name is required ». Impossible d'aller plus loin.

**Attendu**
Le nom est saisi et la commande se poursuit comme pour standard_user.

**Pièces jointes** : `captures/problem-user-lastname.png`

**Notes** : le prénom et le code postal fonctionnent. Ce profil est celui remonté par le support comme « bizarre » : ce ticket explique probablement les plaintes.

---

## SD-03 · [Commande] error_user → Finish ne fait rien, erreur JavaScript, commande jamais confirmée

**Sévérité** : Critique · **Priorité suggérée** : P1 · **Cas de test** : PROF-03 · **Labels** : qa, qa-mission-2026-09, profil-error_user
**Compte** : error_user · **Fréquence** : systématique

**Étapes**
1. Se connecter avec error_user, ajouter le Backpack
2. Checkout, saisir QA / Test / 35000, Continue
3. Sur le récapitulatif, cliquer Finish

**Obtenu**
Rien ne se passe, la page reste sur /checkout-step-two.html. Console : `TypeError: Cannot read properties of undefined (reading 'value')` puis `ai.cesetRart is not a function`.

**Attendu**
Page « Thank you for your order! ».

**Pièces jointes** : `captures/error-user-finish.png`

**Notes** : `cesetRart` ressemble à une faute de frappe sur `resetCart` dans le code. Profil remonté par le support avec des « erreurs au paiement » : c'est celui-là.

---

## SD-04 · [Catalogue] problem_user → « Add to cart » sans effet sur la Fleece Jacket

**Sévérité** : Critique · **Priorité suggérée** : P1 · **Cas de test** : PROF-01 · **Labels** : qa, qa-mission-2026-09, profil-problem_user
**Compte** : problem_user · **Fréquence** : systématique

**Étapes**
1. Se connecter avec problem_user
2. Sur le catalogue, cliquer « Add to cart » sous Sauce Labs Fleece Jacket

**Obtenu**
Aucun badge sur le panier, le bouton ne change pas d'état. Le produit ne peut pas être acheté.

**Attendu**
Badge = 1, bouton « Remove ».

**Notes** : le Backpack s'ajoute normalement avec ce compte. À vérifier sur les six produits : seule la Fleece Jacket a été testée. Pas de capture, le résultat est l'absence de changement.

---

## SD-05 · [Panier] error_user → « Remove » sans effet depuis le catalogue

**Sévérité** : Majeur · **Priorité suggérée** : P2 · **Cas de test** : PROF-03 · **Labels** : qa, qa-mission-2026-09, profil-error_user
**Compte** : error_user · **Fréquence** : systématique

**Étapes**
1. Se connecter avec error_user, ajouter le Backpack (badge = 1)
2. Cliquer « Remove » sur le même produit

**Obtenu**
Le badge reste à 1, le produit reste dans le panier.

**Attendu**
Badge disparaît, bouton revient à « Add to cart ».

**Notes** : contournement possible depuis la page panier, non vérifié avec ce compte.

---

## SD-06 · [Catalogue] error_user → le tri déclenche une alerte « Sorting is broken! »

**Sévérité** : Majeur · **Priorité suggérée** : P2 · **Cas de test** : PROF-03 · **Labels** : qa, qa-mission-2026-09, profil-error_user
**Compte** : error_user · **Fréquence** : systématique

**Étapes**
1. Se connecter avec error_user
2. Choisir « Price (low to high) » dans le menu de tri

**Obtenu**
Boîte de dialogue navigateur : « Sorting is broken! This error has been reported to Backtrace. » Le tri ne s'applique pas.

**Attendu**
Produits triés par prix croissant, sans dialogue.

**Notes** : une alerte native avec un message technique n'est pas acceptable côté utilisateur, même si l'erreur est bien remontée au monitoring.

---

## SD-07 · [Catalogue] problem_user → les six produits affichent la même image cassée

**Sévérité** : Majeur · **Priorité suggérée** : P2 · **Cas de test** : PROF-01 · **Labels** : qa, qa-mission-2026-09, profil-problem_user
**Compte** : problem_user · **Fréquence** : systématique

**Étapes**
1. Se connecter avec problem_user
2. Observer les images du catalogue

**Obtenu**
Les six produits pointent vers la même image `/assets/sl-404-Cq1a9k9X.jpg` (visuel d'erreur 404, un chien).

**Attendu**
Une image par produit, identique à celle vue avec standard_user.

**Pièces jointes** : `captures/problem-user-images.png`

---

## SD-08 · [Connexion] performance_glitch_user → connexion en 5,6 s

**Sévérité** : Majeur · **Priorité suggérée** : P2 · **Cas de test** : PROF-02 · **Labels** : qa, qa-mission-2026-09, performance
**Compte** : performance_glitch_user · **Fréquence** : systématique (5 621 ms mesuré, standard_user : moins de 1 s)

**Étapes**
1. Saisir performance_glitch_user / secret_sauce, cliquer Login
2. Chronométrer jusqu'à l'affichage du catalogue

**Obtenu**
5,6 secondes sans aucun indicateur de chargement.

**Attendu**
Moins de 3 secondes, ou un indicateur de chargement visible.

**Notes** : à mesurer sur plusieurs exécutions côté serveur ; côté navigateur, aucune requête lente visible, le délai semble applicatif.

---

## SD-09 · [Commande] Les champs de livraison acceptent des espaces seuls

**Sévérité** : Majeur · **Priorité suggérée** : P2 · **Cas de test** : CHK-05 · **Labels** : qa, qa-mission-2026-09
**Compte** : standard_user · **Fréquence** : systématique · **Multi-navigateurs** : reproduit sur Chromium, Firefox, WebKit, iPhone 14, Pixel 7

**Étapes**
1. Backpack au panier, Checkout
2. Saisir trois espaces dans First Name, Last Name et Zip/Postal Code
3. Continue

**Obtenu**
Passage au récapitulatif. Une commande peut être finalisée sans nom ni adresse exploitables.

**Attendu**
Même comportement que des champs vides : « First Name is required ».

**Notes** : la validation teste la présence d'une chaîne, pas son contenu. Un `trim()` suffit.

---

## SD-10 · [Commande] Le code postal accepte lettres et symboles

**Sévérité** : Mineur · **Priorité suggérée** : P3 · **Cas de test** : CHK-06 · **Labels** : qa, qa-mission-2026-09
**Compte** : standard_user · **Fréquence** : systématique

**Étapes**
1. Backpack au panier, Checkout
2. Saisir QA / Test / « abc!! », Continue

**Obtenu**
Passage au récapitulatif.

**Attendu**
Refus ou avertissement. Si la boutique livre à l'international, définir le format accepté et le documenter.

**Pièces jointes** : `captures/chk-postal-letters.png`

---

## SD-11 · [Menu] Après « Reset App State », le bouton « Remove » reste affiché

**Sévérité** : Mineur · **Priorité suggérée** : P3 · **Cas de test** : CART-05 · **Labels** : qa, qa-mission-2026-09
**Compte** : standard_user · **Fréquence** : systématique

**Étapes**
1. Ajouter le Backpack (badge = 1, bouton « Remove »)
2. Menu latéral → Reset App State, fermer le menu

**Obtenu**
Le badge disparaît, mais le bouton affiche toujours « Remove ». Cliquer dessus ne fait rien. Il faut recharger la page pour retrouver « Add to cart ».

**Attendu**
Boutons revenus à « Add to cart » sans rechargement.

**Pièces jointes** : `captures/reset-remove-button.png`

---

## SD-12 · [Catalogue] Fiche d'un produit inexistant : « ITEM NOT FOUND » avec un prix « $√-1 »

**Sévérité** : Mineur · **Priorité suggérée** : P3 · **Cas de test** : CAT-04 · **Labels** : qa, qa-mission-2026-09
**Compte** : standard_user · **Fréquence** : systématique

**Étapes**
1. Se connecter
2. Ouvrir https://www.saucedemo.com/inventory-item.html?id=999

**Obtenu**
Page en 200 avec un produit fantôme : nom « ITEM NOT FOUND », prix « $√-1 », bouton « Add to cart » actif.

**Attendu**
Redirection vers le catalogue avec un message, ou page « produit introuvable » sans prix ni bouton d'achat.

**Pièces jointes** : `captures/item-999.png`

**Notes** : un lien partagé vers un produit retiré du catalogue tombera sur cet écran.
