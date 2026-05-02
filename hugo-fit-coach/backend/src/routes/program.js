import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateWeeklyWorkouts, generateWeeklyMeals } from '../services/programService.js';

const router = express.Router();

// Créer un nouveau programme
router.post('/create', authenticateToken, (req, res) => {
  try {
    const { startDate } = req.body;
    
    // Vérifier s'il y a déjà un programme actif
    const existingProgram = db.prepare(
      'SELECT id FROM programs WHERE user_id = ? AND status = ?'
    ).get(req.user.id, 'active');
    
    if (existingProgram) {
      return res.status(409).json({ error: 'Un programme est déjà en cours.' });
    }

    const programId = uuidv4();
    const programStartDate = startDate || new Date().toISOString();

    // Créer le programme
    db.prepare(`
      INSERT INTO programs (id, user_id, start_date, duration_weeks, current_week, status)
      VALUES (?, ?, ?, 12, 1, 'active')
    `).run(programId, req.user.id, programStartDate);

    // Générer les entraînements et repas pour la première semaine
    const workouts = generateWeeklyWorkouts(1, programId);
    const meals = generateWeeklyMeals(1, programId);

    // Sauvegarder les entraînements
    const insertWorkout = db.prepare(`
      INSERT INTO workouts (id, program_id, week, day, duration, difficulty, exercises_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    workouts.forEach(workout => {
      insertWorkout.run(
        workout.id,
        programId,
        workout.week,
        workout.day,
        workout.duration,
        workout.difficulty,
        JSON.stringify(workout.exercises)
      );
    });

    // Sauvegarder les repas
    const insertMeal = db.prepare(`
      INSERT INTO meals (id, program_id, week, day, type, name, calories, protein, carbs, fat, ingredients_json, instructions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    meals.forEach(meal => {
      insertMeal.run(
        meal.id,
        programId,
        meal.week,
        meal.day,
        meal.type,
        meal.name,
        meal.calories,
        meal.protein,
        meal.carbs,
        meal.fat,
        JSON.stringify(meal.ingredients),
        meal.instructions || null
      );
    });

    res.status(201).json({
      message: 'Programme créé avec succès',
      program: {
        id: programId,
        start_date: programStartDate,
        duration_weeks: 12,
        current_week: 1
      }
    });
  } catch (error) {
    console.error('Erreur création programme:', error);
    res.status(500).json({ error: 'Erreur lors de la création du programme.' });
  }
});

// Récupérer le programme actuel
router.get('/current', authenticateToken, (req, res) => {
  try {
    const program = db.prepare(`
      SELECT * FROM programs WHERE user_id = ? AND status = ?
    `).get(req.user.id, 'active');
    
    if (!program) {
      return res.status(404).json({ error: 'Aucun programme actif trouvé.' });
    }

    res.json({ program });
  } catch (error) {
    console.error('Erreur récupération programme:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du programme.' });
  }
});

// Récupérer une semaine spécifique du programme
router.get('/week/:weekNumber', authenticateToken, (req, res) => {
  try {
    const { weekNumber } = req.params;
    const week = parseInt(weekNumber);

    if (week < 1 || week > 12) {
      return res.status(400).json({ error: 'Numéro de semaine invalide (1-12).' });
    }

    const program = db.prepare(`
      SELECT * FROM programs WHERE user_id = ? AND status = ?
    `).get(req.user.id, 'active');
    
    if (!program) {
      return res.status(404).json({ error: 'Aucun programme actif trouvé.' });
    }

    // Récupérer les entraînements de la semaine
    const workouts = db.prepare(`
      SELECT * FROM workouts WHERE program_id = ? AND week = ? ORDER BY day
    `).all(program.id, week);

    // Récupérer les repas de la semaine
    const meals = db.prepare(`
      SELECT * FROM meals WHERE program_id = ? AND week = ? ORDER BY day, type
    `).all(program.id, week);

    // Parser les exercices JSON
    const parsedWorkouts = workouts.map(w => ({
      ...w,
      exercises: JSON.parse(w.exercises_json)
    }));

    // Calculer les macros totaux par jour
    const dailyMacros = {};
    meals.forEach(meal => {
      if (!dailyMacros[meal.day]) {
        dailyMacros[meal.day] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      dailyMacros[meal.day].calories += meal.calories;
      dailyMacros[meal.day].protein += meal.protein;
      dailyMacros[meal.day].carbs += meal.carbs;
      dailyMacros[meal.day].fat += meal.fat;
    });

    res.json({
      week,
      program_id: program.id,
      workouts: parsedWorkouts,
      meals,
      dailyMacros
    });
  } catch (error) {
    console.error('Erreur récupération semaine:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la semaine.' });
  }
});

// Mettre à jour la progression du programme
router.put('/progress', authenticateToken, (req, res) => {
  try {
    const { currentWeek } = req.body;

    if (currentWeek < 1 || currentWeek > 12) {
      return res.status(400).json({ error: 'Numéro de semaine invalide (1-12).' });
    }

    const program = db.prepare(`
      SELECT * FROM programs WHERE user_id = ? AND status = ?
    `).get(req.user.id, 'active');
    
    if (!program) {
      return res.status(404).json({ error: 'Aucun programme actif trouvé.' });
    }

    // Si semaine 12 terminée, marquer le programme comme complété
    const status = currentWeek >= 12 ? 'completed' : 'active';

    db.prepare(`
      UPDATE programs SET current_week = ?, status = ? WHERE id = ?
    `).run(currentWeek, status, program.id);

    // Si nouvelle semaine, générer les données si nécessaire
    if (currentWeek > program.current_week) {
      // Vérifier si les données existent déjà
      const existingWorkouts = db.prepare(
        'SELECT COUNT(*) as count FROM workouts WHERE program_id = ? AND week = ?'
      ).get(program.id, currentWeek);

      if (existingWorkouts.count === 0) {
        const workouts = generateWeeklyWorkouts(currentWeek, program.id);
        const meals = generateWeeklyMeals(currentWeek, program.id);

        const insertWorkout = db.prepare(`
          INSERT INTO workouts (id, program_id, week, day, duration, difficulty, exercises_json)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        workouts.forEach(workout => {
          insertWorkout.run(
            workout.id,
            program.id,
            workout.week,
            workout.day,
            workout.duration,
            workout.difficulty,
            JSON.stringify(workout.exercises)
          );
        });

        const insertMeal = db.prepare(`
          INSERT INTO meals (id, program_id, week, day, type, name, calories, protein, carbs, fat, ingredients_json, instructions)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        meals.forEach(meal => {
          insertMeal.run(
            meal.id,
            program.id,
            meal.week,
            meal.day,
            meal.type,
            meal.name,
            meal.calories,
            meal.protein,
            meal.carbs,
            meal.fat,
            JSON.stringify(meal.ingredients),
            meal.instructions || null
          );
        });
      }
    }

    res.json({ 
      message: 'Progression mise à jour',
      currentWeek,
      status
    });
  } catch (error) {
    console.error('Erreur mise à jour progression:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la progression.' });
  }
});

export default router;
