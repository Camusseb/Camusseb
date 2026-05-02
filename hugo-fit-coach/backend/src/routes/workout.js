import express from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Récupérer l'entraînement du jour
router.get('/today', authenticateToken, (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    const program = db.prepare(`
      SELECT * FROM programs WHERE user_id = ? AND status = ?
    `).get(req.user.id, 'active');
    
    if (!program) {
      return res.status(404).json({ error: 'Aucun programme actif trouve.' });
    }

    const workout = db.prepare(`
      SELECT * FROM workouts WHERE program_id = ? AND week = ? AND day = ?
    `).get(program.id, program.current_week, dayOfWeek);

    if (!workout) {
      return res.json({ 
        message: "Pas d'entrainement prevu aujourd'hui.",
        isRestDay: true,
        suggestion: 'Profitez de cette journee de repos pour recuperer.'
      });
    }

    res.json({
      ...workout,
      exercises: JSON.parse(workout.exercises_json)
    });
  } catch (error) {
    console.error('Erreur recuperation entrainement:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation de l' + "'" + 'entrainement.' });
  }
});

// Marquer un entraînement comme complété
router.put('/:workoutId/complete', authenticateToken, (req, res) => {
  try {
    const { workoutId } = req.params;
    
    db.prepare(`
      UPDATE workouts SET completed = 1 WHERE id = ?
    `).run(workoutId);

    res.json({ message: 'Entrainement marque comme complete!' });
  } catch (error) {
    console.error('Erreur marquage entrainement:', error);
    res.status(500).json({ error: 'Erreur lors du marquage de l' + "'" + 'entrainement.' });
  }
});

export default router;
