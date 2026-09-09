# Checklist de démarrage — Swag Labs · saucedemo.com

Remplie le 2 septembre 2026, avant le cadrage.

## Identité de la mission

| Champ | Valeur |
|---|---|
| Client | Swag Labs (fiction, site de démonstration Sauce Labs) |
| Produit / URL de prod | https://www.saucedemo.com |
| Pack | Audit QA express, 2 jours |
| Dates | Jour 1 : 2 sept. 2026 · Jour 2 : 3 sept. 2026 · Remise : 3 sept. |
| Interlocuteur principal | Responsable produit (fiction) |
| Interlocuteur technique | Lead dev (fiction) |
| Canal des comptes-rendus | Email, un compte-rendu par session |

## Accès

- [x] URL de l'environnement de test : `https://www.saucedemo.com` (staging = prod de démo, pas de données réelles)
- [x] Stable : oui, aucun déploiement pendant la mission
- [x] Comptes de test, un par profil :

| Rôle / profil | Identifiant | Mot de passe | Notes du client |
|---|---|---|---|
| Client standard | standard_user | secret_sauce | Profil de référence |
| Client verrouillé | locked_out_user | secret_sauce | Doit être refusé à la connexion |
| Profil « problème » | problem_user | secret_sauce | Compte remonté par le support comme « bizarre » |
| Profil « lenteur » | performance_glitch_user | secret_sauce | Compte remonté comme lent |
| Profil « erreurs » | error_user | secret_sauce | Compte remonté avec des erreurs au paiement |
| Profil « visuel » | visual_user | secret_sauce | Compte remonté avec des décalages d'affichage |

- [x] Données de test : catalogue de 6 produits, pas de compte vide ni de compte limite (non applicable)
- [x] Paiement : aucun moyen de paiement réel, le tunnel se termine sur une page de confirmation sans transaction
- [x] Outil de ticketing : aucun chez le client → tickets rédigés au format Linear dans `tickets/`
- [x] Dépôt de code : non fourni (site tiers) → suite Playwright livrée dans `e2e/`, prête à être déposée dans un dépôt
- [ ] Logs / monitoring : non fournis
- [x] Canal : email

## Périmètre

- [x] Parcours à tester, par priorité : connexion (P1), catalogue et panier (P1), tunnel de commande (P1), permissions (P2), menu et réinitialisation (P3)
- [x] Ce qui vient d'être modifié : refonte du tunnel de commande (fiction)
- [x] Hors périmètre : paiement réel, création de compte (inexistante), tests de charge, sécurité approfondie
- [x] Navigateurs : Chrome, Firefox, Safari (WebKit)
- [x] Appareils : desktop · iPhone 14 émulé · Pixel 7 émulé (pas d'appareil physique pour la mission blanche)
- [x] Spécifications : aucune ; le comportement attendu est déduit des standards e-commerce et confirmé au cadrage
- [x] Tests automatisés existants : aucun

## Conventions convenues

- [x] Sévérités : Bloquant / Critique / Majeur / Mineur, voir `02-outils/conventions-tickets.md`
- [x] Triage : par le responsable produit, à réception du rapport
- [x] Format du rapport : Markdown + PDF
- [x] Langue : français

## Matériel côté Hugo

- [x] Kit copié dans ce dossier
- [x] Playwright du kit, Chromium / Firefox / WebKit installés
- [x] `e2e/` copié depuis `03-playwright-kit`, `BASE_URL` par défaut sur saucedemo
