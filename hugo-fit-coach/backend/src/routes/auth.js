import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, weight, height, age, sex, goal } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, mot de passe et nom sont requis.' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Cet email est deja utilise.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = uuidv4();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, weight, height, age, sex, goal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, email, passwordHash, weight, height, age, sex, goal || 'perdre_graisse_gagner_muscle');

    const prefId = uuidv4();
    db.prepare(`
      INSERT INTO food_preferences (id, user_id, excluded_foods)
      VALUES (?, ?, '[]')
    `).run(prefId, userId);

    const token = generateToken({ id: userId, email });

    res.status(201).json({
      message: 'Compte cree avec succes',
      token,
      user: { id: userId, email, name, weight, height, age, sex, goal }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe sont requis.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Connexion reussie',
      token,
      user: { id: user.id, email: user.email, name: user.name, weight: user.weight, height: user.height, age: user.age, sex: user.sex, goal: user.goal }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
});

// Récupérer l'utilisateur connecté
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, weight, height, age, sex, goal, created_at FROM users WHERE id = ?').get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouve.' });
    }

    const preferences = db.prepare('SELECT excluded_foods FROM food_preferences WHERE user_id = ?').get(req.user.id);
    const program = db.prepare('SELECT * FROM programs WHERE user_id = ? AND status = ?').get(req.user.id, 'active');

    res.json({
      user,
      preferences: preferences ? JSON.parse(preferences.excluded_foods) : [],
      hasActiveProgram: !!program
    });
  } catch (error) {
    console.error('Erreur recuperation utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des donnees.' });
  }
});

export default router;
