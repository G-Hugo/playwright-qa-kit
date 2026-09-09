# Rapport de fin de mission QA — Swag Labs · saucedemo.com · refonte du tunnel de commande

Audit QA express, 2 et 3 septembre 2026 · Hugo Gaveau · Tales of Dice

Destinataires : responsable produit, lead développeur

## 1. Verdict en une phrase

> Le tunnel de commande fonctionne pour un client standard, mais il accepte une commande vide et laisse passer des adresses sans contenu ; trois des six profils fournis ne peuvent pas commander. Pas livrable en l'état : corriger SD-01, SD-02, SD-03 et SD-04, puis un re-test de 2 heures.

## 2. Chiffres

| Indicateur | Valeur |
|---|---|
| Cas de test exécutés | 28 / 28 planifiés |
| Sessions exploratoires | 2 (23 vérifications outillées en session 1, régression multi-navigateurs en session 2) |
| Anomalies ouvertes | 12 : 1 bloquante · 3 critiques · 5 majeures · 3 mineures |
| Anomalies corrigées pendant la mission | 0 (pas de livraison pendant l'audit) |
| Navigateurs et appareils couverts | Chromium, Firefox, WebKit, iPhone 14 et Pixel 7 en émulation |
| Tests Playwright livrés | 15 tests, 75 exécutions sur 5 cibles, 100 % conformes, 4 bugs connus annotés |

## 3. Top 5 des risques

| # | Anomalie | Sévérité | Ticket | Recommandation |
|---|---|---|---|---|
| 1 | Une commande sans aucun article est confirmée. Reproduit sur les 5 cibles. | Critique | SD-01 | Corriger avant mise en production : refus côté serveur, bouton Checkout désactivé sur panier vide |
| 2 | Le profil problem_user ne peut pas saisir son nom : commande impossible | Bloquant | SD-02 | Corriger avant mise en production. Explique probablement les remontées du support |
| 3 | Le profil error_user ne peut pas finaliser : erreur JavaScript sur Finish (`cesetRart` au lieu de `resetCart` ?) | Critique | SD-03 | Corriger avant mise en production, une ligne à vérifier dans le code |
| 4 | Le profil problem_user ne peut pas ajouter la Fleece Jacket au panier | Critique | SD-04 | Corriger, et vérifier les 5 autres produits avec ce profil |
| 5 | Les champs de livraison acceptent des espaces seuls. Reproduit sur les 5 cibles. | Majeur | SD-09 | Un `trim()` dans la validation, à faire dans le même lot que SD-10 |

## 4. État par parcours

| Parcours | Statut | Commentaire |
|---|---|---|
| Connexion, déconnexion | 🟢 Sain | Compte verrouillé bien refusé, retour arrière après déconnexion bien bloqué |
| Catalogue et panier | 🟡 À surveiller | Sain pour standard_user ; fiche d'un produit inexistant incohérente (SD-12), état des boutons après réinitialisation (SD-11) |
| Tunnel de commande | 🔴 Bloquant pour la prod | Commande vide acceptée (SD-01), validation trop faible (SD-09, SD-10). Totaux et taxe corrects |
| Permissions | 🟢 Sain | Toutes les pages redirigent sans session, liens externes sécurisés |
| Profils signalés par le support | 🔴 | problem_user et error_user ne peuvent pas commander (SD-02, SD-03, SD-04), performance_glitch_user attend 5,6 s à la connexion (SD-08) |
| Multi-navigateurs et mobile | 🟢 Sain | Aucune différence de comportement entre les 5 cibles. Pas de débordement horizontal sur mobile |

## 5. Ce qui n'a pas été testé et pourquoi

- **Profil visual_user** : nécessite une comparaison visuelle écran par écran, hors du format 2 jours. Peut se faire en 2 heures avec des captures de référence Playwright.
- **Appareils physiques** : mobile testé en émulation iPhone 14 et Pixel 7. Le clavier réel, le tactile et Safari iOS natif n'ont pas été vérifiés.
- **Paiement** : le site n'a pas de transaction, le tunnel s'arrête à la confirmation.
- **Sécurité** : un seul contrôle d'injection (prénom, négatif). Pas d'audit de sécurité.

## 6. Observations hors anomalies

- Le bouton Cancel du récapitulatif renvoie au catalogue et non au panier. Pas un défaut, mais un utilisateur qui voulait modifier son panier fait un détour. À trancher côté produit (CHK-08).
- Les identifiants de test sont affichés sur la page de connexion. Normal pour un staging, à vérifier que ce n'est pas le cas en production.
- Le tri, les images et l'ajout au panier varient selon le compte : les anomalies des profils ressemblent à des données de compte corrompues ou à un code conditionnel par profil. Le lead dev saura vite.

## 7. Recommandations pour la suite

1. Corriger SD-01 à SD-04, puis re-test de 2 heures : je rejoue les 28 cas P1 et P2 et la suite Playwright, et je clôture les tickets.
2. Déposer la suite Playwright livrée dans votre dépôt avec le workflow GitHub Actions fourni : elle tourne à chaque pull request et signalera d'elle-même le jour où SD-01, SD-02, SD-03 et SD-09 sont corrigés, grâce aux annotations de bugs connus.
3. Traiter SD-09 et SD-10 ensemble : c'est la même fonction de validation.
4. Prévoir une session de 2 heures sur visual_user avec des captures de référence, si ce profil correspond à des utilisateurs réels.

## 8. Livrables remis

- Tickets : `tickets/tickets.md`, 12 tickets au format Linear, captures dans `tickets/captures/`
- Cas de test : `cas-de-test.md`, 28 cas avec statut
- Plan de test : `plan-de-test.md`
- Comptes-rendus de session : `comptes-rendus.md`
- Suite Playwright : `e2e/`, avec `README.md`, workflow GitHub Actions, reporter de tickets
- Scripts des sessions exploratoires et résultats bruts : `explo/`
- Ce rapport, en Markdown et en PDF

---

Merci pour ces deux jours. Je reste joignable une semaine, sans facturation, pour toute question sur un ticket.
