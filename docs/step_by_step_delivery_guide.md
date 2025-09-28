# Guide pas à pas pour développer Little Secret Online

Ce document détaille une démarche méthodique pour transformer le prototype fourni en une application multijoueur en ligne prête pour la mise en production. Chaque étape comporte les objectifs, les actions recommandées, les points de contrôle et les livrables attendus. Suivez-les dans l'ordre pour bâtir progressivement une solution robuste.

## Étape 0 – Préparation de l'environnement
- **Objectifs** : disposer d'un environnement Node.js fonctionnel, cloner le dépôt et vérifier le fonctionnement de base du serveur et du client.
- **Actions** :
  1. Installer Node.js 18+ (ou utiliser `nvm`), puis exécuter `node -v` et `npm -v` pour valider l'installation.
  2. Cloner le dépôt (`git clone <url>`), ouvrir le dossier dans votre IDE et installer les dépendances avec `npm install` dans `server/` puis `client/`.
  3. Lancer `npm run dev` côté serveur (port 4000) et côté client (Vite, port 5173) dans deux terminaux distincts.
- **Points de contrôle** :
  - Le serveur affiche `listening on port 4000`.
  - Le client ouvre l'URL locale avec l'écran de lobby fonctionnel.
- **Livrables** :
  - Capture d'écran du lobby et journal de console attestant du démarrage des deux services.

## Étape 1 – Cartographier les flux et les états
- **Objectifs** : comprendre les phases de jeu (Lobby, Attribution, Indices, Discussion, Vote, Révélation) et établir une carte d'état synchronisée entre client et serveur.
- **Actions** :
  1. Lire `docs/little_secret_online_spec.md` et noter les transitions attendues.
  2. Auditer `server/src/index.js` pour identifier les événements Socket.IO (`join_room`, `submit_clue`, `cast_vote`, etc.).
  3. Dans `client/src/App.jsx`, relever le state machine existant (`phase`, `timer`, `hostSettings`).
  4. Dessiner (Miro, Whimsical ou papier) le diagramme d'état avec les événements déclencheurs.
- **Points de contrôle** :
  - Diagramme validé avec tous les états et transitions.
  - Liste des événements Socket.IO et payloads documentée.
- **Livrables** :
  - Document partagé (PNG/PDF) avec le schéma d'état et un tableau récapitulatif des événements.

## Étape 2 – Normaliser le modèle de données
- **Objectifs** : clarifier la structure des objets échangés entre client et serveur pour éviter les divergences et préparer la persistance.
- **Actions** :
  1. Extraire les interfaces TypeScript (ou schémas JSDoc) des entités principales : `Player`, `Room`, `Round`, `Vote`, `Clue`.
  2. Ajouter un fichier `docs/data_contracts.md` décrivant ces structures (types, champs optionnels, formats de date/heure).
  3. Mettre en place une validation via `zod` ou `yup` côté serveur pour les payloads entrants critiques (`submit_clue`, `cast_vote`).
- **Points de contrôle** :
  - Schémas alignés entre front et back.
  - Validation renvoyant une erreur claire en cas de données invalides.
- **Livrables** :
  - Nouveau document de contrat de données.
  - Tests unitaires couvrant la validation.

## Étape 3 – Sécuriser les minuteries et la progression automatique
- **Objectifs** : rendre la gestion des timers fiable, même en cas de déconnexions ou de ralentissements réseau.
- **Actions** :
  1. Revoir la logique de `server/src/index.js` responsable des timers (`setInterval`, `advancePhase`).
  2. Remplacer les `setInterval` imbriqués par une machine d'état explicite (ex. `xstate` côté serveur) ou une boucle centrale utilisant `setTimeout`.
  3. Ajouter une persistance en mémoire (ou Redis) pour stocker l'heure de fin de chaque phase et recalculer le temps restant à chaque reconnexion.
  4. Mettre à jour le client pour calculer le temps restant à partir du timestamp serveur (et non d'un compteur local).
- **Points de contrôle** :
  - Les joueurs rejoignant en cours de partie voient le timer correct.
  - Les phases basculent automatiquement sans intervention de l'hôte lorsque l'automatisation est activée.
- **Livrables** :
  - Tests d'intégration simulant plusieurs clients connectés/déconnectés.
  - Section README décrivant la stratégie de synchronisation du temps.

## Étape 4 – Polir l'expérience utilisateur multi-appareils
- **Objectifs** : garantir une ergonomie optimale sur smartphones et tablettes, avec une navigation claire pour les phases de jeu.
- **Actions** :
  1. Passer en revue `client/src/styles.css` et créer un design system (palette, typographies, spacing, composants réutilisables).
  2. Introduire une grille responsive (CSS Grid/Flex) et des breakpoints adaptés (≥320px, ≥768px, ≥1024px).
  3. Ajouter des tests visuels (Storybook + Chromatic ou Playwright) pour les composants critiques (`PhaseBanner`, `ClueForm`, `VoteForm`).
  4. Implémenter des animations douces (transition des phases, compte à rebours) en veillant à la performance mobile.
- **Points de contrôle** :
  - Audit Lighthouse mobile ≥ 90 pour Performance et Accessibilité.
  - Comportement fluide sur un smartphone réel (tests utilisateurs).
- **Livrables** :
  - Documentation du design system.
  - Captures d'écran/tableau comparatif des breakpoints.

## Étape 5 – Gestion des comptes et persistance
- **Objectifs** : permettre à des joueurs récurrents de conserver leurs profils, statistiques et historique de parties.
- **Actions** :
  1. Choisir une base de données (PostgreSQL recommandée) et définir les migrations initiales (`users`, `rooms`, `rounds`, `votes`).
  2. Intégrer un ORM (Prisma, TypeORM) côté serveur.
  3. Ajouter une authentification (auth invités + OAuth ou email magique) et stocker les sessions via JWT ou cookies sécurisés.
  4. Persister les parties terminées avec un calcul de score post-manche.
- **Points de contrôle** :
  - Tests end-to-end couvrant l'inscription, la connexion, la création de salle et la persistance d'une partie.
  - Politique RGPD documentée (durée de conservation, droit à l'oubli).
- **Livrables** :
  - Fichier `docs/architecture_persistence.md` avec le schéma relationnel.
  - Pipelines CI exécutant les migrations et tests.

## Étape 6 – Scalabilité et déploiement
- **Objectifs** : préparer une mise en production résiliente supportant plusieurs salles et joueurs simultanés.
- **Actions** :
  1. Conteneuriser le client et le serveur (`Dockerfile`, `docker-compose.yml`).
  2. Configurer une file Redis ou un adaptateur Socket.IO `redis-adapter` pour le clustering multi-instances.
  3. Mettre en place une infrastructure d'observabilité : métriques (Prometheus), logs structurés (pino), traçage distribué (OpenTelemetry).
  4. Déployer sur une plateforme cloud (ex. Render, Fly.io, AWS ECS) avec un pipeline CI/CD (GitHub Actions).
- **Points de contrôle** :
  - Environnement de staging accessible publiquement.
  - Tests de charge (k6, Artillery) montrant la tenue à ≥ 200 connexions simultanées.
- **Livrables** :
  - Documentation de déploiement (`docs/deployment_runbook.md`).
  - Tableaux de bord observabilité partagés.

## Étape 7 – Intégration IA générative et modération
- **Objectifs** : tirer parti de l'IA pour assister les joueurs et sécuriser l'expérience.
- **Actions** :
  1. Ajouter un service de suggestions d'indices pour les débutants (API OpenAI ou modèle hébergé) avec une interface opt-in.
  2. Mettre en place une modération automatique (filtrage de langage) sur le chat texte et les pseudos.
  3. Proposer un recap narratif de la manche (auto-generated) à la fin de la partie.
  4. Documenter les limites et le budget tokens, prévoir un fallback si l'IA est indisponible.
- **Points de contrôle** :
  - Conformité aux politiques d'usage des APIs IA.
  - Possibilité de désactiver l'IA pour les parties compétitives.
- **Livrables** :
  - Fichier `docs/ai_features.md` décrivant les prompts, les flux et les garde-fous.
  - Tests automatisés simulant un échec d'appel IA.

## Étape 8 – Qualité, conformité et lancement
- **Objectifs** : finaliser la solution pour une mise en ligne durable.
- **Actions** :
  1. Établir une matrice de tests exhaustive (fonctionnelle, non-fonctionnelle, sécurité, accessibilité) et automatiser un maximum de cas.
  2. Réaliser des revues de sécurité (OWASP ASVS) et intégrer un plan de réponse aux incidents.
  3. Préparer la documentation utilisateur (FAQ, guide d'accueil rapide, tutoriels vidéo) et un plan marketing de lancement.
  4. Organiser une bêta fermée, collecter les feedbacks et prioriser les améliorations.
- **Points de contrôle** :
  - Checklists de sortie complètes et approuvées par l'équipe projet.
  - KPIs de lancement définis (taux de rétention, NPS, nombre de parties).
- **Livrables** :
  - Dossier de lancement (OnePager exécutif, plan de communication, calendrier).
  - Tableau de suivi des bugs et améliorations post-bêta.

---

En suivant ces étapes et en validant chaque livrable, vous disposerez d'un cadre de pilotage clair pour mener le développement de Little Secret Online jusqu'à la mise en production, tout en minimisant les risques et en maximisant la qualité de l'expérience multijoueur.
