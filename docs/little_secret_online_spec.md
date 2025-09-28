# Little Secret – Analyse des règles et spécification pour adaptation en ligne multijoueur

## 0. Approche méthodique adoptée
1. **Collecte des sources** : lecture exhaustive des livrets fournis (recto/verso) pour identifier toutes les composantes (narration, rôles, préparatifs, tours de jeu, clarifications, variantes).
2. **Extraction structurée** : transcription des éléments clefs dans une grille (objectifs, séquence, matériel, paramètres) afin d’éviter les omissions et d’assurer la traçabilité.
3. **Modélisation du gameplay** : formalisation des phases (préparation, attribution d’informations, indices, vote, résolution) et des conditions de victoire/défaite.
4. **Projection numérique** : déclinaison des mécaniques physiques en fonctionnalités logicielles (UX/UI, flux réseau, stockage) en tenant compte des contraintes d’un environnement en ligne synchrone.
5. **Spécification technico-fonctionnelle** : définition d’une architecture cible, d’un modèle de données, de mécanismes temps réel et de garde-fous de sécurité.
6. **Planification & gouvernance** : élaboration d’une feuille de route, de KPIs et d’un cadrage organisationnel pour piloter le projet.
7. **Ouverture IA générative** : identification d’usages pertinents de l’IA (assistance, modération, contenu) alignés avec l’expérience de jeu.

## 1. Analyse systématique des règles physiques

### 1.1 Contexte narratif et objectif
- Les joueurs incarnent les Disciples d’une secte internationale qui tient des réunions pour étendre son influence.
- Des journalistes infiltrés cherchent à dérober vos secrets ; votre mission est de les démasquer en révélant leurs informations.
- Un Superman se fait passer pour un Disciple : si son identité est révélée par erreur, les Disciples perdent, alors qu’il l’emporte en réussissant à se faire passer pour l’un d’eux lors des échanges.

### 1.2 Mise en place (Préparation)
1. Mélanger les cartes « Rôles » en fonction du nombre de joueurs présents.
2. Distribuer une carte « Rôle » face cachée à chaque joueur.
3. Placer au centre de la table une carte « Codes Secrets » face visible.

### 1.3 Début de partie et attribution des informations secrètes
1. Tous les joueurs ferment les yeux.
2. Le Journaliste ouvre les yeux pour découvrir son code secret.
3. Le Superman ouvre les yeux, consulte le code secret du Journaliste et mémorise l’information correspondante.
4. Les Disciples ouvrent les yeux ensemble pour découvrir leur mot de code commun.
5. Les Taupes ne reçoivent aucune information (elles gardent les yeux fermés).

### 1.4 Structure d’une manche
1. Une phase d’indices s’enclenche : chacun décrit à voix haute un indice lié au mot qu’il connaît (ou improvise pour brouiller les pistes).
2. Les échanges se déroulent en table ronde dans le sens horaire jusqu’à ce que tous aient parlé.
3. Les clarifications rappellent qu’un Disciple incohérent devient suspect alors qu’une Taupe misera sur des indices génériques.
4. Une fois le tour complet réalisé (ou le temps écoulé), la phase de vote commence.

### 1.5 Système de vote et résolution
1. Tous les joueurs pointent simultanément une cible à l’issue des débats (vote ouvert).
2. Le ou les joueurs ayant le plus de votes sont soumis à l’élimination (ou à une révélation publique de leur carte).
3. Les cartes de rôle révélées déclenchent la résolution :
   - Journaliste découvert : l’information secrète est dévoilée et les Disciples se rapprochent de la victoire.
   - Disciple éliminé : la secte perd un membre loyal, ce qui facilite la tâche des infiltrés.
   - Superman dénoncé : la règle spéciale s’active et la victoire du Superman est immédiate.
4. En cas d’égalité de voix, un second débat ciblé puis un nouveau vote départagent les ex aequo.

### 1.6 Fin de partie
- Les Disciples visent la victoire en identifiant correctement les Journalistes et en évitant de trahir le Superman.
- Le Superman gagne dès que son identité est dénoncée par erreur (condition explicite des règles).
- Les Journalistes et Taupes cherchent à protéger leurs secrets jusqu’à ce que les Disciples échouent ou se trompent (conditions précises à valider avec l’éditeur, cf. section 6.2).

### 1.7 Répartition des rôles selon le nombre de joueurs
| Nombre de joueurs | Disciples | Journalistes | Superman | Taupes |
|-------------------|-----------|--------------|----------|--------|
| 4                 | 2         | 1            | 1        | 0      |
| 5                 | 3         | 1            | 1        | 0      |
| 6                 | 3         | 1            | 1        | 1      |
| 7                 | 4         | 1            | 1        | 1      |
| 8                 | 4         | 2            | 1        | 1      |
| 9                 | 5         | 2            | 1        | 1      |
| 10                | 5         | 3            | 1        | 1      |

### 1.8 Rôles spéciaux et comportements
- **Disciple :** connaît le mot clé exact. Doit identifier les journalistes tout en protégeant le Superman.
- **Journaliste :** possède un mot proche du mot clé des Disciples. Doit faire croire qu’il connaît le mot exact.
- **Superman :** connaît le mot des Disciples et celui du Journaliste. Doit se faire passer pour un Disciple sans se faire démasquer.
- **Taupe :** ne reçoit aucun mot. Doit se faire passer pour un Disciple en improvisant.

### 1.9 Armes secrètes (à partir de 6 joueurs)
- Chaque participant reçoit, en plus de sa carte Rôle, une carte Arme Secrète face cachée.
- Les armes renforcent l’asymétrie : elles s’activent volontairement pendant son propre tour de parole.
- Une fois révélée, l’arme applique son effet unique (ex. forcer un joueur à parler, annuler un indice, imposer un vote, modifier l’ordre de parole) puis est défaussée.
- Les armes sont optionnelles et ne s’utilisent qu’une fois par partie.

### 1.10 Clarifications officielles
- Un Disciple incohérent se met lui-même en danger, car ses coéquipiers interprètent cela comme un signe d’infiltration.
- Une Taupe n’ayant aucun mot doit improviser des indices génériques pour brouiller les pistes.
- Le Superman joue sur deux tableaux : aider les Disciples sans jamais révéler trop clairement qu’il maîtrise les deux mots.

## 2. Spécifications fonctionnelles pour l’adaptation numérique

### 2.1 Objectifs principaux de la version en ligne
1. Reproduire fidèlement la dynamique sociale de bluff et de déduction.
2. Permettre des parties rapides de 10 à 15 minutes avec un lobby facile à rejoindre.
3. Intégrer des outils de communication (chat vocal/texte, emojis) adaptés au débat.
4. Fournir un système de modération automatique (filtrage de langage) et manuel.

### 2.2 Parcours utilisateur (UX)
1. **Accueil**
   - Authentification (invité ou compte).
   - Accès aux règles interactives et tutoriel guidé.
2. **Lobby**
   - Création/joindre une salle (paramètres : nombre max de joueurs, public/privée, armes secrètes activées, durée des débats, mode vocal/texte).
   - Gestion de la liste d’attente et attribution automatique du rôle d’hôte.
3. **Préparation**
   - Affichage animé de la distribution des rôles.
   - Briefing individuel (écran privé) pour le mot et le rôle.
   - Compte à rebours vers le début de partie.
4. **Débat**
   - Interface circulaire représentant les joueurs.
   - Timer visible pour chaque tour de prise de parole.
   - Boutons d’activation des armes secrètes (si disponibles) avec confirmation.
   - Historique des indices en texte (si chat textuel) et possibilité d’emojis de réaction.
   - Option de "tour d’urgence" pour prolonger collectivement le débat (consommation d’un joker de salle).
5. **Vote**
   - Phase dédiée avec affichage des portraits et sélection via clic.
   - Résultats animés, rappel des rôles révélés uniquement au besoin.
6. **Fin de partie**
   - Récapitulatif complet (votes, indices, utilisation des armes).
   - Système de progression (XP, succès) et possibilité de revanche instantanée.

### 2.3 Gestion des rôles et des mots
- Base de données contenant les couples de mots (mot Disciple / mot Journaliste) et les mots neutres.
- Algorithme d’attribution :
  1. Sélectionner un couple aléatoire non utilisé récemment.
  2. Affecter le mot Disciple à tous les Disciples et au Superman.
  3. Affecter le mot Journaliste aux Journalistes.
  4. Taupes reçoivent une carte vide.
- Gestion multilingue possible via tables localisées.

### 2.4 Mécanique de temps
- Paramètres modifiables :
  - Temps de débat initial (ex. 90 secondes).
  - Temps de parole individuel (ex. 20 secondes par joueur) avec possibilité d’extensions via armes secrètes.
  - Temps de vote (ex. 15 secondes).
- Timers synchronisés via serveur (éviter désynchronisation).

### 2.5 Système de vote numérique
- Interface tactile/souris : clic sur un avatar pour voter.
- Affichage en temps réel des votes reçus (optionnel, paramétrable).
- Résolution automatique des égalités : nouvelle phase de débat restreint aux ex aequo, puis second vote.

### 2.6 Armes secrètes en ligne
- Catalogue d’armes configurables (JSON) avec attributs : nom, description, timing autorisé, effet.
- Gestion serveur des effets pour éviter la triche (ex. forcer un joueur à donner un indice via prompt). 
- Animation spécifique et journal d’événements.

### 2.7 Accessibilité et ergonomie
- Mode daltonien pour différencier les rôles révélés.
- Sous-titres générés pour le chat vocal (intégration IA de transcription).
- Raccourcis clavier pour mute/push-to-talk.
- Journal d’accessibilité (rappel audio des phases pour les personnes malvoyantes, vibrations mobiles).

### 2.8 Paramétrage avancé des parties
- Activation/désactivation des armes secrètes et choix de leur rareté.
- Sélection de la durée maximale de partie (nombre de manches).
- Mode compétitif classé avec matchmaking basé sur ELO.
- Mode détente avec indices publics (pédagogie pour nouveaux joueurs).
- Options de personnalisation esthétique des avatars et de la table virtuelle.

## 3. Spécifications techniques

### 3.1 Architecture logicielle
- **Front-end :** Framework SPA (React, Vue ou Svelte) + TypeScript pour typage fort.
- **Back-end temps réel :** Node.js (NestJS) ou Elixir (Phoenix) utilisant WebSockets pour la synchronisation des phases et timers.
- **Base de données :** PostgreSQL pour la persistance des comptes, parties et couples de mots.
- **Infrastructure :** Hébergement cloud (AWS/GCP/Azure) avec conteneurisation Docker et orchestration Kubernetes pour scaler les salons.
- **CI/CD :** GitHub Actions pour tests, lint et déploiements automatiques.

### 3.2 Modèle de données principal
- `User { id, pseudo, avatar, elo, statistiques }`
- `Lobby { id, hôte_id, paramètres, état, joueurs[] }`
- `Game { id, lobby_id, statut, round, paramètres, horodatages }`
- `PlayerState { game_id, user_id, rôle, mot, armes[], micro_status }`
- `SecretWordPair { id, mot_disciple, mot_journaliste, langue, difficulté }`
- `Vote { game_id, round, votant_id, cible_id, timestamp }`
- `EventLog { game_id, type, payload, timestamp }`
- `SecretWeapon { id, nom, description, timing, effet, rareté }`
- `PlayerWeaponUsage { game_id, user_id, weapon_id, round, outcome }`

### 3.3 Synchronisation temps réel
- Canal WebSocket par salon pour :
  - Diffusion des changements d’état (début de phase, fin de phase).
  - Transfert des messages texte/emoji.
  - Commandes pour armes secrètes.
- Utilisation de rooms Socket.io ou Phoenix Channels pour partitionner par partie.
- Gestion des reconnects gracieux (réattribution automatique du rôle et du contexte lorsqu’un joueur revient).

### 3.4 Sécurité et anti-triche
- Vérification serveur de toutes les actions critiques (vote, activation d’arme).
- Limitation des reconnections successives.
- Système de pause contrôlé par l’hôte.
- Modération : signalement des joueurs, bannissement, filtres automatiques.

### 3.5 Scalabilité
- Stockage des parties terminées dans des archives pour replays.
- Sharding des rooms par région géographique.
- Utilisation d’un service TURN pour la voix WebRTC.
- CDN pour la diffusion mondiale des assets statiques.

### 3.6 Qualité logicielle
- Intégration continue (lint, tests unitaires, tests d’intégration réseau simulant les phases de jeu).
- Tests de charge ciblés sur les phases critiques (début de partie, vote simultané).
- Système de feature flags pour activer progressivement les armes secrètes ou l’IA générative.

### 3.7 Observabilité
- Centralisation des logs applicatifs (ELK ou OpenSearch) pour reconstituer une partie.
- Metrics Prometheus/Grafana (latence WebSocket, taux d’abandon, temps de vote).
- Traces distribuées (OpenTelemetry) pour diagnostiquer les ralentissements entre front et back.

## 4. Intégration de l’IA générative

### 4.1 Assistant de partie
- Bot IA facultatif pour combler les joueurs manquants (génération d’indices crédibles en fonction du rôle).
- Conseiller IA en fin de partie qui analyse les logs et suggère des axes d’amélioration.
- Narration dynamique (MJ virtuel) qui contextualise chaque partie et annonce les phases vocalement.

### 4.2 Modération intelligente
- Modèles NLP pour détecter insultes/spam dans le chat.
- Détection d’indices contradictoires pour aider les nouveaux joueurs (option pédagogique).
- Résumé automatique de partie (storytelling) partageable sur les réseaux sociaux.

### 4.3 Contenu dynamique
- Génération procédurale de nouveaux couples de mots thématiques.
- Campagnes narratives saisonnières créées avec assistance IA (quêtes, succès).
- Génération d’illustrations de cartes pour événements spéciaux.

## 5. Roadmap projet

### 5.1 Étapes
1. **Pré-production (4 semaines)**
   - Validation juridique des droits d’adaptation.
   - Spécifications fonctionnelles détaillées, wireframes, user stories.
2. **Prototype alpha (8 semaines)**
   - Implémentation du cœur de gameplay (distribution, débat texte, vote).
   - Interface basique et tests internes.
3. **Bêta fermée (6 semaines)**
   - Ajout du chat vocal, armes secrètes, progression.
   - Tests utilisateurs + équilibrage.
4. **Lancement officiel (4 semaines)**
   - Optimisation performance, mise en place marketing.
5. **Post-lancement (continu)**
   - Ajout IA générative, contenu saisonnier, tournois.

### 5.2 Indicateurs clés (KPIs)
- Temps moyen pour trouver une partie.
- Taux de rétention à J+1, J+7.
- Nombre moyen de signalements par partie.
- Taux de satisfaction post-partie.
- Taux de conversion du tutoriel en partie complète.
- Pourcentage d’utilisation des armes secrètes lorsque disponibles.

### 5.3 Organisation projet recommandée
- **Product Owner** : porte la vision, priorise les user stories.
- **Chef de projet IT/IA** : coordination transversale, suivi planning/risques, pilotage IA générative.
- **Lead Game Designer** : garantit la fidélité aux mécaniques de bluff et l’équilibrage.
- **Équipe dev front** (2-3 personnes) : UX en temps réel, intégration WebRTC.
- **Équipe dev back** (2-3 personnes) : logique de partie, orchestrations, persistance.
- **Data/IA engineer** : pipelines NLP, modération, bots.
- **QA & UX Research** : tests fonctionnels, sessions utilisateurs.
- **LiveOps** : animation post-lancement, monitoring.

### 5.4 Principaux risques & mitigations
- **Risque de triche via canaux externes** : encourager le vocal intégré, ajouter détection d’onglets inactifs en mode compétitif.
- **Toxicité du chat** : modération IA + reporting humain + sanctions graduées.
- **Latence réseau** : serveurs régionaux, optimisation WebSocket, compensation audio.
- **Complexité IA générative** : phases pilotes sur des salons dédiés, monitoring des dérives, validation humaine.
- **Respect de la licence** : sécuriser les accords d’adaptation avant développement complet.

## 6. Annexes

### 6.1 Règles originales synthétisées
- Distribution des rôles et mots selon le tableau de la section 1.7.
- Utilisation optionnelle des armes secrètes à partir de 6 joueurs.
- Importance de la cohérence des indices pour les Disciples, improvisation pour les Taupes.

### 6.2 Hypothèses et points à clarifier
- Validation exacte des effets des armes secrètes (liste exhaustive à obtenir auprès de l’éditeur).
- Confirmation des conditions de victoire exactes des Journalistes lorsque plusieurs restent en jeu.
- Paramètres audio/vidéo à définir (intégration WebRTC vs. solution tierce).

### 6.3 Glossaire interne
- **Indice** : mot/phrase utilisée pour suggérer le code secret détenu.
- **Manche** : séquence complète "indices → vote → résolution".
- **Lobby** : salle d’attente configurée avant la partie.
- **Arme secrète** : pouvoir ponctuel consommable modifiant le flux normal de la manche.
- **MJ virtuel** : composant logiciel orchestrant les annonces et les phases.

### 6.4 Correspondance physique → numérique
- Cartes Rôle → Attributs `PlayerState.rôle` et interface privée responsive.
- Carte Codes Secrets → Écran partagé contenant les mots colorés, accessible uniquement selon le rôle.
- Vote en pointant du doigt → Interface de sélection + animation de main virtuelle.
- Débat oral autour de la table → Salon vocal/texte avec timer et indicateur du joueur actif.
- Armes secrètes physiques → Widgets interactifs synchronisés via serveur + effets audités.

