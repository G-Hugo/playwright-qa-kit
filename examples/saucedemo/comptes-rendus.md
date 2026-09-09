# Comptes-rendus de session — Swag Labs

Envoyés par email au responsable produit après chaque session. Cinq lignes, toujours les mêmes : fait, trouvé, bloqué, suite, question.

## Session 1 · 2 septembre 2026 · cadrage et exploration du tunnel

**Fait** : cadrage 45 min, plan de test validé, 6 comptes vérifiés, session exploratoire outillée sur le tunnel de commande, les formulaires, les permissions et les trois profils signalés par le support (23 vérifications).
**Trouvé** : 12 anomalies, dont 1 bloquante (SD-02, problem_user ne peut pas commander), 3 critiques (SD-01 commande avec panier vide confirmée, SD-03 error_user ne peut pas finaliser, SD-04 produit impossible à ajouter). Les tickets SD-01 à SD-12 sont rédigés.
**Bloqué** : rien. Site stable toute la session.
**Suite** : demain, suite Playwright sur les parcours critiques, exécution sur Firefox, Safari et mobile, consolidation et rapport.
**Question** : le bouton Cancel du récapitulatif renvoie au catalogue plutôt qu'au panier. Voulu ?

## Session 2 · 3 septembre 2026 · automatisation et multi-navigateurs

**Fait** : 18 tests Playwright écrits (connexion, panier, commande, permissions), exécutés sur Chromium, Firefox, WebKit, iPhone 14 et Pixel 7. Les trois bugs SD-01, SD-09 et SD-02/SD-03 sont annotés comme bugs connus dans la suite : elle passera au vert d'elle-même quand ils seront corrigés.
**Trouvé** : aucune anomalie supplémentaire sur Firefox, WebKit et mobile. SD-01 et SD-09 reproduits sur les cinq cibles.
**Bloqué** : pas d'appareil physique pour la mission blanche, mobile en émulation uniquement. Signalé dans le rapport.
**Suite** : rapport de fin de mission envoyé ce soir, restitution de 30 min à convenir.
**Question** : souhaitez-vous que la suite Playwright soit déposée dans votre dépôt avec le workflow GitHub Actions ? Il est prêt.
