# DiagIA — Audit IA Web

Application web pour conduire un **audit de maturité IA générative** (TPE, PME, établissements scolaires).

## Fonctionnalités

- Questionnaire guidé orienté audit IA.
- Score global **/100** + score par pilier **/20**.
- Détection des risques (gouvernance, conformité, shadow AI).
- Plan d’action **30/60/90 jours**.
- Export des résultats en **JSON/CSV**.

## Lancement local (dev)

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Mise en production

### Option 1 — Serveur Node natif

```bash
npm run start
```

Variables:
- `PORT` (défaut `8080`)
- `HOST` (défaut `0.0.0.0`)

Endpoints:
- `GET /` application
- `GET /healthz` healthcheck

Sécurité HTTP intégrée:
- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`

### Option 2 — Docker

```bash
docker build -t diagia-audit:latest .
docker run -d --name diagia-audit -p 8080:8080 diagia-audit:latest
```

Puis vérifier:

```bash
curl http://localhost:8080/healthz
```

## Tests

```bash
npm run check
npm run test
```

Le script `npm run test` inclut les tests de logique métier et les tests serveur (healthcheck, méthodes HTTP, anti-traversal).

## Démo rapide (audit faible maturité)

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
