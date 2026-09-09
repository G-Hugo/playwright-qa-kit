# Plan de test — Swag Labs · saucedemo.com · refonte du tunnel de commande

Rédigé le 2 septembre 2026, jour 1. Validé par le responsable produit (fiction) le même jour.

## 1. Objectif

Vérifier que le tunnel de commande refondu est livrable pour les six profils d'utilisateurs fournis, sur Chrome, Firefox et Safari, desktop et mobile, avant le 3 septembre 2026.

## 2. Périmètre

**Dans le périmètre**

| Priorité | Parcours / module | Pourquoi c'est critique |
|---|---|---|
| P1 | Connexion, déconnexion, compte verrouillé | Bloque tout le reste |
| P1 | Catalogue : liste, tri, fiche produit, ajout et retrait du panier | Cœur de valeur |
| P1 | Tunnel de commande : panier → informations → récapitulatif → confirmation | Argent, ce qui vient d'être refondu |
| P2 | Permissions : accès direct aux pages sans session, retour arrière après déconnexion | Fuites de données |
| P2 | Profils « problème », « lenteur », « erreurs » signalés par le support | Non encore expliqués |
| P3 | Menu latéral, « Reset App State », liens du pied de page | Gênant, pas bloquant |

**Hors périmètre** : paiement réel, création de compte, tests de charge, sécurité au-delà d'un contrôle d'injection basique, profil « visuel » (nécessite une comparaison visuelle manuelle, reporté).

## 3. Environnement

- Staging : https://www.saucedemo.com · 6 comptes fournis (voir `checklist-demarrage.md`)
- Navigateurs : Chromium 140, Firefox, WebKit (Playwright) · Mobile : iPhone 14 et Pixel 7 émulés
- Tickets : `tickets/` au format Linear, préfixe `SD-`

## 4. Approche

1. **Cas de test scriptés** sur les P1 et P2 : 26 cas (`cas-de-test.md`).
2. **Sessions exploratoires outillées** : une charte par session, exécutée avec un script Playwright qui constate et capture (`explo/`). Session 1 : tunnel de commande, validation des formulaires, permissions, comptes à problème. Session 2 : régression multi-navigateurs et mobile via la suite automatisée.
3. **Automatisation** des parcours P1 en Playwright, livrée avec les bugs connus annotés pour servir de non-régression après correction.

## 5. Matrice de couverture

| Parcours | Chrome desktop | Firefox | Safari | iPhone | Android | Cas scriptés | Explo |
|---|---|---|---|---|---|---|---|
| Connexion | ✔ | ✔ | ✔ | ✔ | ✔ | 5 | 1 session |
| Catalogue et panier | ✔ | ✔ | ✔ | ✔ | ✔ | 6 | 1 session |
| Tunnel de commande | ✔ | ✔ | ✔ | ✔ | ✔ | 8 | 1 session |
| Permissions | ✔ | ✔ | ✔ | | | 4 | 1 session |
| Profils signalés | ✔ | | | | | 3 | 1 session |

## 6. Critères

- **Entrée** : site accessible, six comptes valides, périmètre validé. Atteint le 2 septembre à 10 h.
- **Sortie** : tous les cas P1 exécutés, rapport remis, aucun bloquant sans décision du client.
- **Suspension** : site indisponible plus de 2 h.

## 7. Sévérités

Bloquant (impossible d'avancer) · Critique (fonction majeure KO ou incohérence de données) · Majeur (dégradé mais contournable) · Mineur (cosmétique, texte).

## 8. Livrables et planning

| Jour | Livrable |
|---|---|
| Jour 1 | Ce plan, session exploratoire 1, premiers tickets, compte-rendu |
| Jour 2 | Suite Playwright multi-navigateurs, tickets consolidés, rapport de fin de mission, restitution |

## 9. Risques identifiés au cadrage

| Risque | Impact | Parade |
|---|---|---|
| Pas de spécifications | L'attendu est discutable sur les cas limites | Chaque attendu est explicité dans le ticket, le client tranche |
| Pas d'appareil physique | Les défauts tactiles ou de clavier mobile peuvent échapper | Émulation iPhone et Pixel, signalé dans le rapport |
| Comptes « profils » = état du compte et non de l'application | Un bug peut être lié aux données du compte | Chaque ticket précise le compte de reproduction |
