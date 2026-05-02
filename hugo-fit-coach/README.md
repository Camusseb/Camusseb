# Hugo Fit Coach 🏋️‍♂️

Application full-stack de coaching fitness et nutrition sur 12 semaines, sans équipement, personnalisée.

## 🎯 Fonctionnalités

### 1. Programme 12 Semaines Complet
- Progression automatique de la difficulté (débutant → intermédiaire → avancé)
- 4 séances d'entraînement par semaine (25-35 minutes)
- Plans de repas quotidiens (1800 cal, 120g+ protéines)

### 2. Routine Matinale Quotidienne
- Plan de 30 minutes combinant sport et nutrition
- Défi quotidien pour renforcer la discipline
- Phrase motivante personnalisée

### 3. Entraînements Maison Sans Équipement
- Exercices au poids du corps uniquement
- Séances progressives sur 12 semaines
- Zéro abonnement, zéro matériel, zéro excuse

### 4. Plan de Repas Hebdomadaire
- 1800 calories/jour, 120g+ de protéines
- Peu de glucides transformés
- Ingrédients abordables
- Macros détaillés
- Liste de courses automatique

### 5. Gestion des Fringales
- 10 snacks à fort volume < 200 calories
- Script anti-craving à se répéter
- Stratégies comportementales

### 6. Journal Matinal 5 Minutes
- Rappel de l'objectif
- Action du jour
- Chose pour laquelle on est reconnaissant
- Affirmation liée au fitness

### 7. Suivi des Habitudes (5 Questions Quotidiennes)
- Plan alimentaire respecté ?
- Entraînement fait ?
- Heures de sommeil ?
- Niveau d'énergie ?
- Litres d'eau bus ?

### 8. Revue Hebdomadaire (Dimanche)
- Analyse du poids et tour de taille
- Note de régularité sur 10
- Ajustements pour la semaine suivante

## 🛠️ Stack Technique

### Backend
- **Node.js + Express** : API RESTful
- **SQLite** : Base de données légère
- **JWT** : Authentification sécurisée
- **bcryptjs** : Hashage des mots de passe

### Frontend (à implémenter)
- **React + Vite** : SPA moderne
- **TailwindCSS** : Styling responsive
- **React Query** : Cache serveur
- **React Router** : Navigation

## 📁 Structure du Projet

```
hugo-fit-coach/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Contrôleurs (logique métier)
│   │   ├── routes/          # Routes API
│   │   │   ├── auth.js      # Inscription/Connexion
│   │   │   ├── user.js      # Profil utilisateur
│   │   │   ├── program.js   # Programmes 12 semaines
│   │   │   ├── workout.js   # Entraînements
│   │   │   ├── meal.js      # Repas et nutrition
│   │   │   └── tracking.js  # Suivi quotidien & journal
│   │   ├── services/        # Services métier
│   │   │   └── programService.js  # Génération programmes
│   │   ├── middleware/      # Middleware (auth, validation)
│   │   │   └── auth.js      # JWT authentication
│   │   ├── database.js      # Configuration SQLite
│   │   └── server.js        # Point d'entrée
│   ├── data/                # Base de données SQLite
│   ├── .env                 # Variables d'environnement
│   └── package.json
├── frontend/                # (À implémenter)
├── ARCHITECTURE.md          # Documentation technique
└── README.md                # Ce fichier
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js v18+
- npm ou yarn

### Installation Backend

```bash
cd hugo-fit-coach/backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env  # Ou éditer .env directement

# Démarrer le serveur en développement
npm run dev

# Ou en production
npm start
```

Le serveur démarre sur `http://localhost:5000`

## 📡 API Endpoints

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |
| GET | `/api/auth/me` | Récupérer son profil |

### Utilisateur
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/user/profile` | Voir son profil |
| PUT | `/api/user/profile` | Modifier son profil |
| GET | `/api/user/preferences` | Préférences alimentaires |
| PUT | `/api/user/preferences` | Modifier préférences |

### Programme
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/program/create` | Créer un programme 12 semaines |
| GET | `/api/program/current` | Programme actuel |
| GET | `/api/program/week/:n` | Détails d'une semaine |
| PUT | `/api/program/progress` | Mettre à jour progression |

### Entraînements
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/workouts/today` | Entraînement du jour |
| PUT | `/api/workouts/:id/complete` | Marquer comme fait |

### Nutrition
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/meals/week/:n` | Repas de la semaine |
| GET | `/api/meals/shopping-list/:n` | Liste de courses |
| GET | `/api/meals/anti-craving-snacks` | Snacks anti-fringales |
| GET | `/api/meals/anti-craving-script` | Script anti-envie |

### Suivi
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/tracking/daily` | Suivi quotidien (5 questions) |
| GET | `/api/tracking/history` | Historique des suivis |
| POST | `/api/tracking/weekly-review` | Revue hebdomadaire |
| POST | `/api/tracking/journal` | Journal matinal |
| GET | `/api/tracking/journal/history` | Historique du journal |

## 📝 Exemple d'Utilisation

### 1. Créer un compte

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hugo@example.com",
    "password": "monMotDePasse123",
    "name": "Hugo Caron",
    "weight": 80,
    "height": 175,
    "age": 28,
    "sex": "H",
    "goal": "perdre_graisse_gagner_muscle"
  }'
```

### 2. Se connecter

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hugo@example.com",
    "password": "monMotDePasse123"
  }'
```

### 3. Créer un programme

```bash
curl -X POST http://localhost:5000/api/program/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### 4. Récupérer l'entraînement du jour

```bash
curl http://localhost:5000/api/workouts/today \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### 5. Soumettre le suivi quotidien

```bash
curl -X POST http://localhost:5000/api/tracking/daily \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{
    "sleepHours": 7.5,
    "energyLevel": 8,
    "waterLiters": 2.5,
    "workoutCompleted": true,
    "dietFollowed": true
  }'
```

## 🔐 Sécurité

- JWT avec expiration 7 jours
- Hashage bcrypt (12 rounds)
- Validation des inputs
- CORS configuré
- HTTPS requis en production

## 📊 Base de Données

Tables principales :
- `users` : Utilisateurs et profil
- `programs` : Programmes 12 semaines
- `workouts` : Séances d'entraînement
- `meals` : Plans de repas
- `daily_logs` : Suivi quotidien
- `journal_entries` : Journal matinal
- `weekly_reviews` : Revues hebdomadaires

## 🎨 Prochaines Étapes

1. ✅ Backend API fonctionnelle
2. ⏳ Frontend React à implémenter
3. ⏳ Tests unitaires et E2E
4. ⏳ Dockerisation
5. ⏳ Déploiement production

## 📄 Licence

MIT - Libre utilisation

---

**Développé avec 💪 par Hugo Fit Coach**

*Les coachs à 200€/mois font exactement ça. Maintenant tu l'as gratuitement.*
