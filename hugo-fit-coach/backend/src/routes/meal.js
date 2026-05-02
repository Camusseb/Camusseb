import express from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateShoppingList, antiCravingSnacks, getAntiCravingScript } from '../services/programService.js';

const router = express.Router();

// Récupérer les repas de la semaine
router.get('/week/:weekNumber', authenticateToken, (req, res) => {
  try {
    const { weekNumber } = req.params;
    const week = parseInt(weekNumber);

    const program = db.prepare(`
      SELECT * FROM programs WHERE user_id = ? AND status = ?
    `).get(req.user.id, 'active');
    
    if (!program) {
      return res.status(404).json({ error: 'Aucun programme actif trouvé.' });
    }

    const meals = db.prepare(`
      SELECT * FROM meals WHERE program_id = ? AND week = ? ORDER BY day, type
    `).all(program.id, week);

    // Calculer les macros totaux par jour
    const dailyMeals = {};
    const dailyMacros = {};

    meals.forEach(meal => {
      if (!dailyMeals[meal.day]) {
        dailyMeals[meal.day] = { breakfast: null, lunch: null, dinner: null, snack: null };
        dailyMacros[meal.day] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      dailyMeals[meal.day][meal.type] = meal;
      dailyMacros[meal.day].calories += meal.calories;
      dailyMacros[meal.day].protein += meal.protein;
      dailyMacros[meal.day].carbs += meal.carbs;
      dailyMacros[meal.day].fat += meal.fat;
    });

    res.json({
      week,
      meals: dailyMeals,
      dailyMacros
    });
  } catch (error) {
    console.error('Erreur récupération repas:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des repas.' });
  }
});

// Récupérer la liste de courses pour la semaine
router.get('/shopping-list/:weekNumber', authenticateToken, (req, res) => {
  try {
    const { weekNumber } = req.params;
    const week = parseInt(weekNumber);

    const program = db.prepare(`
      SELECT * FROM programs WHERE user_id = ? AND status = ?
    `).get(req.user.id, 'active');
    
    if (!program) {
      return res.status(404).json({ error: 'Aucun programme actif trouvé.' });
    }

    const meals = db.prepare(`
      SELECT ingredients_json FROM meals WHERE program_id = ? AND week = ?
    `).all(program.id, week);

    // Reconstruire les objets meals pour la liste de courses
    const mealsWithIngredients = meals.map(m => ({
      ingredients: JSON.parse(m.ingredients_json)
    }));

    const shoppingList = generateShoppingList({
      forEach: function(callback) {
        mealsWithIngredients.forEach(callback);
      }
    });

    res.json({ shoppingList });
  } catch (error) {
    console.error('Erreur génération liste de courses:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de la liste de courses.' });
  }
});

// Récupérer les snacks anti-fringales
router.get('/anti-craving-snacks', authenticateToken, (req, res) => {
  res.json({ snacks: antiCravingSnacks });
});

// Récupérer le script anti-fringale
router.get('/anti-craving-script', authenticateToken, (req, res) => {
  res.json({ script: getAntiCravingScript() });
});

export default router;
