import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Récupérer le profil utilisateur
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, email, name, weight, height, age, sex, goal, created_at, updated_at 
      FROM users WHERE id = ?
    `).get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil.' });
  }
});

// Mettre à jour le profil utilisateur
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { weight, height, age, sex, goal } = req.body;
    
    db.prepare(`
      UPDATE users 
      SET weight = ?, height = ?, age = ?, sex = ?, goal = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(weight || null, height || null, age || null, sex || null, goal || null, req.user.id);

    res.json({ message: 'Profil mis à jour avec succès.' });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil.' });
  }
});

// Récupérer les préférences alimentaires
router.get('/preferences', authenticateToken, (req, res) => {
  try {
    const preferences = db.prepare('SELECT excluded_foods FROM food_preferences WHERE user_id = ?').get(req.user.id);
    
    res.json({ 
      excludedFoods: preferences ? JSON.parse(preferences.excluded_foods) : [] 
    });
  } catch (error) {
    console.error('Erreur récupération préférences:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des préférences.' });
  }
});

// Mettre à jour les préférences alimentaires
router.put('/preferences', authenticateToken, (req, res) => {
  try {
    const { excludedFoods } = req.body;
    
    if (!Array.isArray(excludedFoods)) {
      return res.status(400).json({ error: 'excludedFoods doit être un tableau.' });
    }

    const existingPref = db.prepare('SELECT id FROM food_preferences WHERE user_id = ?').get(req.user.id);
    
    if (existingPref) {
      db.prepare('UPDATE food_preferences SET excluded_foods = ? WHERE user_id = ?')
        .run(JSON.stringify(excludedFoods), req.user.id);
    } else {
      db.prepare('INSERT INTO food_preferences (id, user_id, excluded_foods) VALUES (?, ?, ?)')
        .run(uuidv4(), req.user.id, JSON.stringify(excludedFoods));
    }

    res.json({ message: 'Préférences mises à jour avec succès.' });
  } catch (error) {
    console.error('Erreur mise à jour préférences:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des préférences.' });
  }
});

export default router;
