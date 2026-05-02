import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Soumettre le suivi quotidien (5 questions)
router.post('/daily', authenticateToken, (req, res) => {
  try {
    const { date, weight, waist, sleepHours, energyLevel, waterLiters, workoutCompleted, dietFollowed, notes } = req.body;
    
    const logId = uuidv4();
    const logDate = date || new Date().toISOString().split('T')[0];

    // Vérifier s'il y a déjà un log pour cette date
    const existingLog = db.prepare(
      'SELECT id FROM daily_logs WHERE user_id = ? AND date = ?'
    ).get(req.user.id, logDate);

    if (existingLog) {
      // Mettre à jour
      db.prepare(`
        UPDATE daily_logs 
        SET weight = ?, waist = ?, sleep_hours = ?, energy_level = ?, 
            water_liters = ?, workout_completed = ?, diet_followed = ?, notes = ?
        WHERE user_id = ? AND date = ?
      `).run(
        weight || null, waist || null, sleepHours || null, energyLevel || null,
        waterLiters || null, workoutCompleted ? 1 : 0, dietFollowed ? 1 : 0, notes || null,
        req.user.id, logDate
      );
    } else {
      // Créer nouveau
      db.prepare(`
        INSERT INTO daily_logs (id, user_id, date, weight, waist, sleep_hours, energy_level, water_liters, workout_completed, diet_followed, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        logId, req.user.id, logDate, weight || null, waist || null, sleepHours || null, 
        energyLevel || null, waterLiters || null, workoutCompleted ? 1 : 0, 
        dietFollowed ? 1 : 0, notes || null
      );
    }

    res.json({ message: 'Suivi quotidien enregistré avec succès.' });
  } catch (error) {
    console.error('Erreur suivi quotidien:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du suivi.' });
  }
});

// Récupérer l'historique des suivis
router.get('/history', authenticateToken, (req, res) => {
  try {
    const { days = 30 } = req.query;
    const limitDays = parseInt(days);

    const logs = db.prepare(`
      SELECT * FROM daily_logs 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT ?
    `).all(req.user.id, limitDays);

    res.json({ logs });
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique.' });
  }
});

// Soumettre une revue hebdomadaire
router.post('/weekly-review', authenticateToken, (req, res) => {
  try {
    const { weekNumber, weightChange, waistChange, consistencyScore, adjustments, notes } = req.body;

    const reviewId = uuidv4();

    // Vérifier s'il y a déjà une revue pour cette semaine
    const existingReview = db.prepare(
      'SELECT id FROM weekly_reviews WHERE user_id = ? AND week_number = ?'
    ).get(req.user.id, weekNumber);

    if (existingReview) {
      return res.status(409).json({ error: 'Une revue existe déjà pour cette semaine.' });
    }

    db.prepare(`
      INSERT INTO weekly_reviews (id, user_id, week_number, weight_change, waist_change, consistency_score, adjustments_json, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reviewId, req.user.id, weekNumber, weightChange || null, waistChange || null,
      consistencyScore || null, JSON.stringify(adjustments || {}), notes || null
    );

    res.status(201).json({ message: 'Revue hebdomadaire enregistrée avec succès.' });
  } catch (error) {
    console.error('Erreur revue hebdomadaire:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la revue.' });
  }
});

// Récupérer les revues hebdomadaires
router.get('/weekly-reviews', authenticateToken, (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT * FROM weekly_reviews 
      WHERE user_id = ? 
      ORDER BY week_number DESC
    `).all(req.user.id);

    res.json({ reviews });
  } catch (error) {
    console.error('Erreur récupération revues:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des revues.' });
  }
});

// Journal matinal - Créer une entrée
router.post('/journal', authenticateToken, (req, res) => {
  try {
    const { date, goalReminder, dailyAction, gratitude, affirmation } = req.body;
    
    const entryId = uuidv4();
    const entryDate = date || new Date().toISOString().split('T')[0];

    // Vérifier s'il y a déjà une entrée pour cette date
    const existingEntry = db.prepare(
      'SELECT id FROM journal_entries WHERE user_id = ? AND date = ?'
    ).get(req.user.id, entryDate);

    if (existingEntry) {
      return res.status(409).json({ error: 'Une entrée de journal existe déjà pour cette date.' });
    }

    db.prepare(`
      INSERT INTO journal_entries (id, user_id, date, goal_reminder, daily_action, gratitude, affirmation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(entryId, req.user.id, entryDate, goalReminder || null, dailyAction || null, gratitude || null, affirmation || null);

    res.status(201).json({ message: 'Journal enregistré avec succès.' });
  } catch (error) {
    console.error('Erreur journal:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du journal.' });
  }
});

// Récupérer l'historique du journal
router.get('/journal/history', authenticateToken, (req, res) => {
  try {
    const { days = 7 } = req.query;
    const limitDays = parseInt(days);

    const entries = db.prepare(`
      SELECT * FROM journal_entries 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT ?
    `).all(req.user.id, limitDays);

    res.json({ entries });
  } catch (error) {
    console.error('Erreur récupération journal:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du journal.' });
  }
});

export default router;
