# Cas de test — Swag Labs · saucedemo.com

Exécutés les 2 et 3 septembre 2026. Compte `standard_user` sauf mention. Navigateur Chromium sauf mention ; la colonne « Multi » indique le résultat de la suite Playwright sur Firefox, WebKit, iPhone 14 et Pixel 7.

Statuts : ✔ passé · ✘ échoué (ticket) · ⚠ passé avec remarque · — non exécuté

| ID | Parcours | Titre | Étapes | Résultat attendu | Prio | Statut | Multi | Ticket |
|---|---|---|---|---|---|---|---|---|
| AUTH-01 | Connexion | Identifiants valides | Saisir standard_user / secret_sauce, valider | Liste des produits affichée, URL /inventory.html | P1 | ✔ | ✔ | |
| AUTH-02 | Connexion | Mot de passe erroné | standard_user / mauvais mot de passe | Message « do not match », reste sur la page de connexion | P1 | ✔ | ✔ | |
| AUTH-03 | Connexion | Champs vides | Valider sans rien saisir | « Username is required » | P1 | ✔ | ✔ | |
| AUTH-04 | Connexion | Compte verrouillé | locked_out_user / secret_sauce | « this user has been locked out » | P1 | ✔ | ✔ | |
| AUTH-05 | Connexion | Retour arrière après déconnexion | Se déconnecter, bouton Précédent | Retour à la connexion avec message, pas de contenu | P2 | ✔ | | |
| CAT-01 | Catalogue | Liste des produits | Après connexion | 6 produits, nom, prix, image, bouton d'ajout | P1 | ✔ | ✔ | |
| CAT-02 | Catalogue | Tri prix croissant | Choisir « Price (low to high) » | Prix ordonnés 7.99 → 49.99 | P1 | ✔ | | |
| CAT-03 | Catalogue | Fiche produit | Cliquer un nom | Fiche avec nom, description, prix, bouton retour | P2 | ✔ | | |
| CAT-04 | Catalogue | Fiche d'un produit inexistant | Ouvrir /inventory-item.html?id=999 | Message clair ou redirection, pas de données fantaisistes | P3 | ✘ | | SD-12 |
| CART-01 | Panier | Ajouter un produit | Ajouter le Backpack | Badge = 1, bouton devient « Remove » | P1 | ✔ | ✔ | |
| CART-02 | Panier | Ajouter deux produits | Ajouter Backpack + Bike Light, ouvrir le panier | Badge = 2, deux lignes dans le panier | P1 | ✔ | ✔ | |
| CART-03 | Panier | Retirer depuis le panier | Retirer le Backpack dans le panier | Ligne supprimée, badge disparaît | P1 | ✔ | ✔ | |
| CART-04 | Panier | Persistance après rechargement | Ajouter un produit, F5 | Badge toujours à 1 | P2 | ✔ | | |
| CART-05 | Panier | Reset App State | Ajouter un produit, menu → Reset App State | Panier vidé ET bouton revenu à « Add to cart » | P3 | ✘ | | SD-11 |
| CHK-01 | Commande | Commande complète | Backpack → Checkout → QA / Test / 35000 → Continue → Finish | « Thank you for your order! » | P1 | ✔ | ✔ | |
| CHK-02 | Commande | Totaux du récapitulatif | Backpack + Bike Light, aller au récapitulatif | Item total 39.98, Tax 3.20 (8 %), Total 43.18 | P1 | ✔ | ✔ | |
| CHK-03 | Commande | Champs obligatoires vides | Continue sans rien saisir, puis prénom seul | « First Name is required », puis « Last Name is required » | P1 | ✔ | ✔ | |
| CHK-04 | Commande | Commande avec panier vide | Ouvrir /checkout-step-one.html sans article, remplir, Continue, Finish | Refus ou retour au catalogue ; aucune confirmation | P1 | ✘ | ✘ | SD-01 |
| CHK-05 | Commande | Champs remplis d'espaces | Prénom, nom, code postal = espaces, Continue | Refus comme pour des champs vides | P1 | ✘ | ✘ | SD-09 |
| CHK-06 | Commande | Code postal alphanumérique | Code postal « abc!! », Continue | Refus ou avertissement | P2 | ✘ | | SD-10 |
| CHK-07 | Commande | Injection dans le prénom | Prénom `<img src=x onerror=…>`, continuer jusqu'au récapitulatif | Aucun script exécuté | P2 | ✔ | | |
| CHK-08 | Commande | Annuler depuis le récapitulatif | Cancel à l'étape 2 | Retour au catalogue, panier conservé | P3 | ⚠ | | Retour au catalogue et non au panier : choix produit à confirmer |
| PERM-01 | Permissions | Catalogue sans session | Ouvrir /inventory.html déconnecté | Redirection connexion + message | P1 | ✔ | ✔ | |
| PERM-02 | Permissions | Panier et tunnel sans session | /cart.html, /checkout-step-two.html, /checkout-complete.html déconnecté | Redirection connexion + message, pour les trois | P1 | ✔ | | |
| PERM-03 | Permissions | Liens externes du pied de page | Inspecter les liens Twitter, Facebook, LinkedIn | target=_blank avec rel=noopener ou noreferrer | P3 | ✔ | | |
| MOB-01 | Mobile | Parcours P1 sur iPhone 14 | AUTH-01, CART-01, CHK-01 en émulation | Rien de coupé, pas de défilement horizontal | P1 | ✔ | ✔ | Émulation, pas d'appareil réel |
| PROF-01 | Profils | problem_user : catalogue et commande | Se connecter, ajouter la Fleece Jacket, aller aux informations, saisir un nom | Images correctes, ajout fonctionnel, nom saisissable | P2 | ✘ | | SD-02, SD-04, SD-07 |
| PROF-02 | Profils | performance_glitch_user : connexion | Se connecter, mesurer | Moins de 3 s | P2 | ✘ | | SD-08 |
| PROF-03 | Profils | error_user : tri, retrait, commande | Trier, retirer un produit, terminer une commande | Comme standard_user | P2 | ✘ | | SD-03, SD-05, SD-06 |

## Bilan

| | |
|---|---|
| Cas exécutés | 28 / 28 |
| Passés | 19 · dont 1 avec remarque |
| Échoués | 9, couverts par 12 tickets |
| Non exécutés | 0 |
