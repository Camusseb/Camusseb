# Hugo Fit Coach - Architecture Système

## Vue d'ensemble
Application full-stack de coaching fitness et nutrition sur 12 semaines, sans équipement, personnalisée.

## Stack Technique

### Backend
- **Node.js + Express** : API RESTful
- **SQLite** : Base de données légère (évoluable vers PostgreSQL)
- **JWT** : Authentification
- **bcrypt** : Hashage des mots de passe

### Frontend
- **React + Vite** : SPA moderne et rapide
- **TailwindCSS** : Styling responsive
- **React Query** : Gestion du cache serveur
- **React Router** : Navigation

## Architecture des Modules

### 1. Module Utilisateur
- Profil (poids, taille, âge, sexe, objectif)
- Préférences alimentaires (exclusions)
- Suivi des progrès (poids, tour de taille)

### 2. Module Programme 12 Semaines
- Génération de programme personnalisé
- Progression hebdomadaire
- Adaptation basée sur les performances

### 3. Module Entraînements
- Bibliothèque d'exercices au poids du corps
- Séances de 25-35 minutes
- 4 jours/semaine
- Difficulté progressive

### 4. Module Nutrition
- Plans de repas 1800 cal/jour
- 120g+ de protéines
- Liste de courses automatique
- Macros détaillés

### 5. Module Routine Matinale
- Plan quotidien 30 min (sport + nutrition)
- Défi du jour
- Phrase motivante personnalisée

### 6. Module Journal & Habitudes
- Journal matinal 5 min
- Tracking quotidien (5 questions)
- Affirmations fitness

### 7. Module Revue Hebdomadaire
- Analyse dimanche (poids, taille, régularité)
- Ajustements automatiques
- Recommandations pour la semaine suivante

### 8. Module Gestion des Fringales
- 10 snacks <200 calories
- Scripts anti-craving
- Stratégies comportementales

## Structure de la Base de Données

```sql
-- Utilisateurs
users (id, email, password_hash, name, weight, height, age, sex, goal, created_at)

-- Préférences alimentaires
food_preferences (id, user_id, excluded_foods)

-- Programmes
programs (id, user_id, start_date, duration_weeks, current_week, status)

-- Entraînements
workouts (id, program_id, week, day, duration, difficulty, exercises_json)

-- Repas
meals (id, program_id, week, day, type, calories, protein, carbs, fat, ingredients_json)

-- Suivi quotidien
daily_logs (id, user_id, date, weight, waist, sleep_hours, energy_level, water_liters, workout_completed, diet_followed)

-- Journal
journal_entries (id, user_id, date, goal_reminder, daily_action, gratitude, affirmation)

-- Revues hebdomadaires
weekly_reviews (id, user_id, week_number, weight_change, waist_change, consistency_score, adjustments_json)
```

## API Endpoints

### Authentification
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Utilisateur
- GET /api/user/profile
- PUT /api/user/profile
- GET /api/user/preferences
- PUT /api/user/preferences

### Programme
- GET /api/program/current
- GET /api/program/week/:weekNumber
- PUT /api/program/progress

### Entraînements
- GET /api/workouts/today
- GET /api/workouts/week/:weekNumber
- GET /api/exercises/library

### Nutrition
- GET /api/meals/week/:weekNumber
- GET /api/meals/shopping-list
- GET /api/snacks/anti-craving

### Routine & Journal
- GET /api/morning-routine/today
- POST /api/journal/daily
- GET /api/journal/history

### Tracking
- POST /api/tracking/daily
- GET /api/tracking/history
- POST /api/tracking/weekly-review

## Flux Utilisateur

1. **Onboarding** : Inscription + questionnaire profil
2. **Génération Programme** : Création du plan 12 semaines personnalisé
3. **Dashboard Quotidien** :
   - Routine matinale
   - Entraînement du jour (si prévu)
   - Repas du jour
   - Journal 5 min
   - Tracking 5 questions
4. **Revue Dimanche** : Bilan + ajustements

## Sécurité
- HTTPS en production
- JWT avec expiration courte + refresh tokens
- Hashage bcrypt (12 rounds)
- Validation des inputs (Zod/Joi)
- Rate limiting
- CORS configuré

## Évolutivité
- Architecture modulaire
- Base de données migrable vers PostgreSQL
- Cache Redis possible pour les sessions
- Docker-ready pour déploiement
- Tests unitaires et E2E prévus

## Prochaines Étapes
1. Initialiser le backend (Express + SQLite)
2. Créer les modèles de données
3. Implémenter l'authentification
4. Développer les services de génération de programmes
5. Construire le frontend React
6. Intégrer les composants UI
7. Tests et validation
8. Préparation production
