# DiagIA — Audit IA Web

Application web statique pour conduire un **audit de maturité IA générative** (TPE, PME, établissements scolaires).

## Ce que fait cette version

- Questionnaire guidé orienté **audit IA** (gouvernance, conformité, usages, compétences, pilotage).
- Score de maturité global **/100** et score par pilier **/20**.
- Détection des risques clés (gouvernance faible, conformité, shadow AI).
- Plan d’action automatique **30/60/90 jours**.
- Export des résultats en **JSON/CSV**.

## Lancer en local

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Tests

```bash
node --check app.js
node --check audit-core.js
node --test tests/audit-core.test.js
```

## Démo rapide

Exemple de réponses (maturité faible pour voir les recommandations):

1. `MonOrg, PME`
2. `20`
3. `Standardiser les process`
4. `non`
5. `non`
6. `non`
7. `non`
8. `oui`
9. `1`
10. `non`
11. `non`
12. `non`
13. `non`

À la fin, vérifier:
- score global,
- 5 scores piliers,
- plan d'action,
- export JSON/CSV.
