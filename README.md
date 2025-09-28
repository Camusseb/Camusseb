## Little Secret Online

Ce dépôt contient les spécifications détaillées de l'adaptation numérique du jeu de société Little Secret ainsi qu'un prototype jouable en ligne reposant sur React et Socket.IO.

### Prérequis

- **Node.js 18+** (inclut `npm`). Téléchargez la version LTS sur [nodejs.org](https://nodejs.org/) ou installez-la via `nvm` :

  ```bash
  nvm install --lts
  nvm use --lts
  ```

- Un terminal (PowerShell sur Windows, Terminal sur macOS/Linux).
- Deux fenêtres ou onglets de terminal pour lancer séparément le serveur et le client.

### Installation des dépendances

1. Clonez le dépôt puis placez-vous à la racine du projet :

   ```bash
   git clone <url-du-depot>
   cd Camusseb
   ```

2. Installez les dépendances du serveur :

   ```bash
   cd server
   npm install
   ```

3. Installez les dépendances du client :

   ```bash
   cd ../client
   npm install
   ```

> 💡 Astuce débutant : si vous ne vous sentez pas à l’aise avec la navigation entre dossiers, ouvrez deux terminaux séparés et exécutez `npm install` dans chacun (`server` puis `client`).

### Lancer le projet en développement

1. **Démarrer le serveur Socket.IO** (premier terminal) :

   ```bash
   cd server
   npm run dev
   ```

   Le serveur écoute sur [http://localhost:4000](http://localhost:4000). Laissez cette commande tourner.

2. **Démarrer l’interface React** (second terminal) :

   ```bash
   cd client
   npm run dev
   ```

   Vite affichera une URL du type `http://localhost:5173`. Ouvrez-la dans votre navigateur. Pour simuler plusieurs joueurs, ouvrez plusieurs onglets ou utilisez plusieurs appareils connectés au même réseau.

3. **Arrêter les services** : revenez dans chaque terminal et appuyez sur `Ctrl+C` lorsque vous avez terminé.

### Structure

- `docs/` : documentation et spécifications stratégiques.
- `server/` : serveur Node.js (Express + Socket.IO) gérant les salles, rôles, indices et votes.
- `client/` : interface React responsive optimisée pour mobile et desktop.

### Fonctionnalités clés

- Paramétrage fin des minuteries de manche : l'hôte peut ajuster les durées des phases Indices, Débat et Vote directement depuis le lobby.
- Progression automatique optionnelle : des compteurs côté serveur orchestrent l'enchaînement des phases et affichent un compte à rebours partagé.
- Sécurité réseau : les transitions forcent un recalcul robuste même en cas de votes manquants ou de départ d'un joueur.

### Scripts utiles

- `npm run dev` (client) : lance Vite en mode développement.
- `npm run build` (client) : génère la version de production du front-end.
- `npm run dev` (server) : démarre le serveur en mode watch.
- `npm run start` (server) : démarre le serveur en production.

### Roadmap

- Ajout d'un chat textuel in-app pour les discussions écrites.
- Support des rôles avancés (journalistes, taupes) décrits dans les spécifications.
- Persistance des parties et reprise à chaud après une déconnexion.

### Guides pas à pas

- Consultez `docs/step_by_step_delivery_guide.md` pour suivre, étape par étape, la transformation du prototype en produit en
  ligne prêt pour la mise en production.
- Consultez `docs/deployment_runbook.md` pour obtenir la recette détaillée et la procédure de mise en production (staging puis
  production) avec checklists et bonnes pratiques opérationnelles.
