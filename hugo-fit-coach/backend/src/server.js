import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, db } from './database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import programRoutes from './routes/program.js';
import workoutRoutes from './routes/workout.js';
import mealRoutes from './routes/meal.js';
import trackingRoutes from './routes/tracking.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/program', programRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/tracking', trackingRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hugo Fit Coach API is running' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialisation et démarrage du serveur
const startServer = () => {
  try {
    // Initialiser la base de données
    initDatabase();
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Hugo Fit Coach API démarrée sur le port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

export default app;
