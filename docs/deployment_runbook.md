# Recette et mise en production de Little Secret Online

Ce runbook décrit, étape par étape, la préparation d'un environnement de recette (staging) puis d'un déploiement en production
pour Little Secret Online. Il est conçu pour des profils débutants souhaitant être guidés précisément tout en adoptant les
bonnes pratiques d'un chef de projet IT/IA.

---

## 1. Préparer l'infrastructure

### 1.1 Choisir l'hébergement
- **Staging** : privilégiez un fournisseur simple (Render, Railway, Fly.io) ou un VPS léger (DigitalOcean 1 vCPU / 1 Go RAM).
- **Production** : optez pour une plate-forme gérée offrant scalabilité horizontale (Heroku, Render Pro, AWS ECS/Fargate,
  Kubernetes managé) ou un cluster de VM derrière un load balancer.
- **Domaines & certificats** : réservez un nom de domaine (ex. `littlesecret.app`) et planifiez l'émission de certificats TLS
  via Let's Encrypt ou le gestionnaire de certificats du cloud.

### 1.2 Préparer les environnements
Créez deux environnements isolés :
- **staging** : miroite la configuration de production mais avec des ressources réduites ; restreignez l'accès par mot de passe.
- **production** : haute disponibilité, supervision renforcée, budgets définis.

| Composant             | Staging                                 | Production                                     |
| --------------------- | ---------------------------------------- | ---------------------------------------------- |
| Node.js               | v18 LTS                                  | v18 LTS (même version)                         |
| Base de données       | PostgreSQL géré (free tier) ou SQLite    | PostgreSQL HA (min. 2 vCPU, sauvegardes auto)  |
| Cache/adapter Socket  | Optionnel (Redis simple)                 | Redis managé avec persistance                  |
| Stockage fichiers     | S3-compatible (ex. Backblaze)            | S3/Azure Blob avec versioning                  |

---

## 2. Préparer les artefacts applicatifs

### 2.1 Normaliser les variables d'environnement
Créez un fichier `.env.example` à la racine du repo avec :
```
NODE_ENV=
SERVER_PORT=4000
CLIENT_URL=http://localhost:5173
REDIS_URL=
DATABASE_URL=
SESSION_SECRET=
```
- Copiez ce modèle pour `server/.env` et `client/.env` dans chaque environnement.
- Générer des secrets via `openssl rand -hex 32`.
- Stockez les valeurs réelles dans le gestionnaire de secrets du fournisseur (Render secrets, AWS SSM Parameter Store, Vault).

### 2.2 Construire les images Docker
1. **Serveur** : créer `server/Dockerfile` (Node 18-alpine) avec installation de dépendances puis `npm run build` si nécessaire.
2. **Client** : créer `client/Dockerfile` (Node 18 pour build, Nginx pour servir) avec `npm run build` puis copie du `dist/`.
3. Créer un `docker-compose.yml` pour orchestrer localement :
   ```yaml
   services:
     api:
       build: ./server
       ports: ["4000:4000"]
       env_file: server/.env
     web:
       build: ./client
       ports: ["5173:80"]
       env_file: client/.env
   ```
4. Vérifier localement : `docker compose up --build` puis tester `http://localhost:5173`.
5. Pousser les images vers un registre (GitHub Container Registry, Docker Hub) avec tags `staging` et `production`.

### 2.3 Pipeline CI/CD
- **CI** : GitHub Actions déclenchant `npm ci`, `npm run lint`, `npm test`, `npm run build` (client + serveur) à chaque PR.
- **CD** : workflows distincts `deploy-staging.yml` et `deploy-production.yml` déclenchés via tags (`vX.Y.Z`) ou boutons manuels
  (`workflow_dispatch`).
- Inclure des étapes pour :
  1. Récupérer les secrets (`secrets.DEPLOY_TOKEN`).
  2. Construire et pousser les images Docker taggées (`${{ github.sha }}` + `staging`/`prod`).
  3. Déclencher le déploiement sur l'hébergeur (API Render/Fly, `kubectl apply`, `helm upgrade`, etc.).

---

## 3. Déploiement en environnement de recette (staging)

### 3.1 Provisionner les ressources
1. Créez une base PostgreSQL et notez l'URL d'accès.
2. Déployez un Redis managé léger si vous souhaitez tester la scalabilité Socket.IO.
3. Configurez un bucket de stockage si vous prévoyez des assets téléversés (avatars, journaux).

### 3.2 Lancer le backend
1. Définissez les variables d'environnement :
   - `NODE_ENV=staging`
   - `SERVER_PORT=4000`
   - `CLIENT_URL=https://staging.littlesecret.app`
   - `DATABASE_URL=...`
   - `SESSION_SECRET=...`
2. Déployez l'image Docker `api:staging` sur l'hébergeur.
3. Exposez le port 4000 derrière HTTPS (configurer le reverse proxy ou l'ingress).
4. Vérifiez les logs (`docker logs`, console Render) pour vous assurer que le serveur écoute bien.

### 3.3 Lancer le frontend
1. Déployez l'image `web:staging` sur un service statique (Netlify, Vercel, S3+CloudFront, ou même le même PaaS via Nginx).
2. Configurez la variable `VITE_API_URL=https://staging-api.littlesecret.app`.
3. Purgez le cache CDN, vérifiez via `curl -I https://staging.littlesecret.app` que la réponse est 200.

### 3.4 Vérifications fonctionnelles
- **Smoke tests** : créer une salle, inviter un second joueur, parcourir toutes les phases.
- **Tests automatisés** : exécuter la suite Playwright/Cypress contre l'URL de staging (`npm run test:e2e -- --base-url=...`).
- **Checklist** : latence < 200 ms depuis l'Europe, timers synchronisés, votes collectés correctement.
- Documenter les anomalies dans un canal #staging et corriger avant production.

---

## 4. Déploiement en production

### 4.1 Préparation finale
- Valider la checklist de sortie (sécurité, accessibilité, performance) de l'Étape 8 du guide principal.
- Congeler les merges : seules les hotfixs critiques sont autorisées pendant la fenêtre de mise en prod.
- Générer un tag versionné (`git tag v1.0.0 && git push origin v1.0.0`).

### 4.2 Exécuter le pipeline
1. Lancer le workflow `deploy-production.yml` ou déclencher le déploiement Render/Fly.
2. Sur Kubernetes :
   ```bash
   kubectl apply -f k8s/namespace-prod.yml
   kubectl apply -f k8s/redis-prod.yml
   kubectl apply -f k8s/api-deployment.yml
   kubectl apply -f k8s/web-deployment.yml
   kubectl rollout status deploy/api
   kubectl rollout status deploy/web
   ```
3. Confirmer que les services sont routés via HTTPS (`curl -I https://app.littlesecret.app`).

### 4.3 Contrôles post-déploiement
- **Monitoring** : dashboards Grafana/Datadog pour CPU, mémoire, temps de réponse, taux d'erreur.
- **Logs** : vérifier l'absence d'exceptions non gérées (`pino`, `winston`).
- **Alerting** : notifications Slack/Email en cas de latence > 500 ms ou erreurs 5xx > 1% sur 5 minutes.
- **Validation UX** : un membre de l'équipe joue une partie complète avec de vrais joueurs dans l'heure suivant la mise en prod.

### 4.4 Plan de rollback
- Conservez l'image précédente (`api:prod-<sha>`, `web:prod-<sha>`).
- Sur incident critique :
  ```bash
  kubectl rollout undo deploy/api --to-revision=<n>
  kubectl rollout undo deploy/web --to-revision=<n>
  ```
  ou déclenchez le workflow `rollback-production.yml`.
- Communiquez immédiatement aux utilisateurs via bannière in-app ou réseau social.

---

## 5. Maintenance continue

### 5.1 Observabilité et qualité
- Mettre en place des sondes `healthcheck` (`/healthz`) côté serveur pour l'orchestrateur.
- Collecter les métriques clés : nombre de salles actives, joueurs simultanés, temps moyen par manche, taux de déconnexion.
- Planifier des tests de charge trimestriels (Artillery/k6) pour vérifier la tenue des SLA.

### 5.2 Sécurité
- Activer les mises à jour automatiques sur l'OS / runtime.
- Auditer les dépendances avec `npm audit --production` et `snyk test` chaque mois.
- Renouveler les secrets tous les 90 jours, appliquer le principe du moindre privilège sur les accès cloud.

### 5.3 Processus de support
- Créer un runbook d'incident : classification (mineur, majeur, critique), canaux de communication, délais de réponse.
- Mettre en place un formulaire ou un bot pour collecter les feedbacks joueurs.
- Prévoir une astreinte pour les soirées/week-ends si la base d'utilisateurs est active.

---

## 6. Checklist synthétique

| Étape | Action | Responsable | Statut |
| ----- | ------ | ----------- | ------ |
| 1     | Infra staging provisionnée | DevOps | ☐ |
| 2     | Secrets configurés | Tech Lead | ☐ |
| 3     | Images Docker publiées | CI/CD | ☐ |
| 4     | Déploiement staging validé | QA | ☐ |
| 5     | Tests de charge ok | QA | ☐ |
| 6     | Go/No-Go meeting | PM | ☐ |
| 7     | Déploiement production | DevOps | ☐ |
| 8     | Monitoring post-prod | Support | ☐ |
| 9     | Retro & améliorations | Toute l'équipe | ☐ |

---

En suivant ce guide opérationnel, vous disposez d'une recette reproductible et d'une stratégie de mise en production alignée sur
les standards des projets multijoueurs temps réel. Chaque étape peut être intégrée dans votre gestion de projet Agile afin de
sécuriser la livraison et la montée en charge de Little Secret Online.
