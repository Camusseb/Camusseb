import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../data/hugo_fit.db'));

// Activer les clés étrangères
db.pragma('foreign_keys = ON');

// Création des tables
const initDatabase = () => {
  // Table utilisateurs
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      weight REAL,
      height INTEGER,
      age INTEGER,
      sex TEXT CHECK(sex IN ('H', 'F')),
      goal TEXT DEFAULT 'perdre_graisse_gagner_muscle',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table préférences alimentaires
  db.exec(`
    CREATE TABLE IF NOT EXISTS food_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      excluded_foods TEXT DEFAULT '[]',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Table programmes
  db.exec(`
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      start_date DATETIME,
      duration_weeks INTEGER DEFAULT 12,
      current_week INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Table entraînements
  db.exec(`
    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      program_id TEXT NOT NULL,
      week INTEGER NOT NULL,
      day INTEGER NOT NULL,
      duration INTEGER DEFAULT 30,
      difficulty TEXT DEFAULT 'beginner' CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
      exercises_json TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0,
      FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
    )
  `);

  // Table repas
  db.exec(`
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      program_id TEXT NOT NULL,
      week INTEGER NOT NULL,
      day INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('breakfast', 'lunch', 'dinner', 'snack')),
      name TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      ingredients_json TEXT NOT NULL,
      instructions TEXT,
      FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
    )
  `);

  // Table suivi quotidien
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date DATE NOT NULL,
      weight REAL,
      waist INTEGER,
      sleep_hours REAL,
      energy_level INTEGER CHECK(energy_level BETWEEN 1 AND 10),
      water_liters REAL,
      workout_completed BOOLEAN DEFAULT 0,
      diet_followed BOOLEAN DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    )
  `);

  // Table journal
  db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date DATE NOT NULL,
      goal_reminder TEXT,
      daily_action TEXT,
      gratitude TEXT,
      affirmation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    )
  `);

  // Table revues hebdomadaires
  db.exec(`
    CREATE TABLE IF NOT EXISTS weekly_reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      weight_change REAL,
      waist_change INTEGER,
      consistency_score INTEGER CHECK(consistency_score BETWEEN 0 AND 10),
      adjustments_json TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, week_number)
    )
  `);

  console.log('✅ Base de données initialisée avec succès');
};

export { db, initDatabase };
