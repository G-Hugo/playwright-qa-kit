# Mission blanche — Swag Labs (saucedemo.com) · septembre 2026

Mission de rodage du kit, pack **Audit QA express (2 jours)**, réalisée sur la boutique de démonstration [saucedemo.com](https://www.saucedemo.com). Tout ce qui est dans ce dossier est produit avec les modèles du kit, dans l'ordre réel d'une mission, et sert d'exemple montrable aux prospects.

Contexte de la fiction : Swag Labs est une boutique en ligne qui sort une refonte de son tunnel de commande. Le client fournit un staging et six comptes de test correspondant à des profils d'utilisateurs. Il n'a pas d'outil de ticketing : les tickets sont rédigés dans `tickets/` au format Linear.

Transparence : saucedemo.com est un site d'entraînement édité par Sauce Labs, qui contient des défauts volontaires. Les anomalies ci-dessous sont réelles et reproductibles, mais elles ne sont pas des bugs « surprises » pour son éditeur.

| Fichier | Rôle |
|---|---|
| `checklist-demarrage.md` | Ce que le client a fourni, ce qui a été convenu |
| `plan-de-test.md` | Périmètre, approche, matrice de couverture, validé le jour 1 |
| `cas-de-test.md` | 26 cas exécutés avec leur statut |
| `explo/` | Scripts des sessions exploratoires outillées et leurs résultats bruts |
| `tickets/` | 12 tickets au format du kit, captures dans `tickets/captures/` |
| `comptes-rendus.md` | Les comptes-rendus envoyés au client après chaque session |
| `rapport-fin-mission.md` + `.pdf` | Le rapport remis au client |
| `../../tests/checkout.spec.ts` | Suite Playwright livrée (à la racine de ce dépôt) : parcours critiques verts, bugs connus annotés |

Pour rejouer la suite Playwright : à la racine du dépôt, `npm install && npx playwright install && npm test`.
