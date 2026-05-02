// Service de génération de programmes fitness et nutrition

// Bibliothèque d'exercices au poids du corps
const exerciseLibrary = {
  beginner: [
    { name: 'Squats', sets: 3, reps: 12, rest: 60, muscle: 'jambes' },
    { name: 'Push-ups (genoux)', sets: 3, reps: 8, rest: 60, muscle: 'pectoraux' },
    { name: 'Lunges', sets: 3, reps: 10, rest: 60, muscle: 'jambes' },
    { name: 'Plank', sets: 3, reps: '30s', rest: 45, muscle: 'core' },
    { name: 'Glute Bridge', sets: 3, reps: 12, rest: 60, muscle: 'fessiers' },
    { name: 'Mountain Climbers', sets: 3, reps: '20s', rest: 60, muscle: 'cardio' },
    { name: 'Superman', sets: 3, reps: 10, rest: 60, muscle: 'dos' },
    { name: 'Jumping Jacks', sets: 3, reps: '30s', rest: 45, muscle: 'cardio' }
  ],
  intermediate: [
    { name: 'Pistol Squats (assistés)', sets: 3, reps: 8, rest: 90, muscle: 'jambes' },
    { name: 'Push-ups', sets: 4, reps: 12, rest: 60, muscle: 'pectoraux' },
    { name: 'Bulgarian Split Squats', sets: 3, reps: 10, rest: 90, muscle: 'jambes' },
    { name: 'Plank avec rotation', sets: 3, reps: '45s', rest: 60, muscle: 'core' },
    { name: 'Single Leg Glute Bridge', sets: 3, reps: 10, rest: 60, muscle: 'fessiers' },
    { name: 'Burpees', sets: 3, reps: 8, rest: 90, muscle: 'full body' },
    { name: 'Reverse Snow Angels', sets: 3, reps: 12, rest: 60, muscle: 'dos' },
    { name: 'High Knees', sets: 3, reps: '40s', rest: 60, muscle: 'cardio' },
    { name: 'Diamond Push-ups', sets: 3, reps: 8, rest: 60, muscle: 'triceps' },
    { name: 'Side Plank', sets: 3, reps: '30s', rest: 45, muscle: 'core' }
  ],
  advanced: [
    { name: 'Pistol Squats', sets: 4, reps: 8, rest: 120, muscle: 'jambes' },
    { name: 'Archer Push-ups', sets: 4, reps: 10, rest: 90, muscle: 'pectoraux' },
    { name: 'Jump Squats', sets: 4, reps: 15, rest: 90, muscle: 'jambes' },
    { name: 'Plank to Push-up', sets: 4, reps: '60s', rest: 60, muscle: 'core' },
    { name: 'Nordic Curl (négatifs)', sets: 3, reps: 6, rest: 120, muscle: 'ischios' },
    { name: 'Burpees avec saut', sets: 4, reps: 12, rest: 90, muscle: 'full body' },
    { name: 'Handstand Hold (mur)', sets: 3, reps: '30s', rest: 90, muscle: 'épaules' },
    { name: 'Mountain Climbers rapides', sets: 4, reps: '45s', rest: 60, muscle: 'cardio' },
    { name: 'Tricep Dips (chaise)', sets: 4, reps: 12, rest: 60, muscle: 'triceps' },
    { name: 'V-ups', sets: 4, reps: 12, rest: 60, muscle: 'core' }
  ]
};

// Plans de repas type (1800 cal, 120g+ protéines)
const mealPlans = {
  breakfast: [
    {
      name: 'Omelette aux épinards et fromage blanc',
      calories: 450,
      protein: 35,
      carbs: 15,
      fat: 28,
      ingredients: ['3 œufs', '100g épinards', '50g fromage blanc 0%', '1 tranche pain complet'],
      instructions: 'Cuire les œufs brouillés avec les épinards, accompagner du fromage blanc et du pain.'
    },
    {
      name: 'Porridge protéiné aux fruits rouges',
      calories: 420,
      protein: 30,
      carbs: 55,
      fat: 12,
      ingredients: ['60g flocons avoine', '1 scoop whey vanille', '150g fruits rouges', '200ml lait amande'],
      instructions: 'Cuire l\'avoine avec le lait, ajouter la whey après cuisson, topped avec les fruits.'
    },
    {
      name: 'Toast avocat et œuf poché',
      calories: 480,
      protein: 28,
      carbs: 35,
      fat: 25,
      ingredients: ['2 tranches pain complet', '1 avocat', '2 œufs', 'sel, poivre'],
      instructions: 'Griller le pain, étaler l\'avocat, poser les œufs pochés dessus.'
    }
  ],
  lunch: [
    {
      name: 'Poulet grillé, quinoa et légumes rôtis',
      calories: 550,
      protein: 45,
      carbs: 50,
      fat: 18,
      ingredients: ['150g blanc de poulet', '80g quinoa', '200g légumes mixtes', '1 c.à.s huile olive'],
      instructions: 'Cuire le poulet, préparer le quinoa, rôtir les légumes à l\'huile d\'olive.'
    },
    {
      name: 'Salade thon, œuf et haricots rouges',
      calories: 520,
      protein: 42,
      carbs: 35,
      fat: 22,
      ingredients: ['1 boîte thon naturel', '2 œufs durs', '150g haricots rouges', 'salade verte', 'vinaigrette légère'],
      instructions: 'Mélanger tous les ingrédients dans un bol, assaisonner.'
    },
    {
      name: 'Wrap dinde et houmous',
      calories: 540,
      protein: 40,
      carbs: 48,
      fat: 20,
      ingredients: ['1 wrap complet', '120g blanc de dinde', '3 c.à.s houmous', 'crudités variées'],
      instructions: 'Étaler le houmous, ajouter la dinde et les crudités, rouler serré.'
    }
  ],
  dinner: [
    {
      name: 'Saumon, patate douce et brocolis',
      calories: 520,
      protein: 40,
      carbs: 40,
      fat: 22,
      ingredients: ['150g saumon', '200g patate douce', '200g brocolis', 'citron'],
      instructions: 'Cuire le saumon au four, vapeur pour les brocolis, patate douce rôtie.'
    },
    {
      name: 'Wok de bœuf et légumes asiatiques',
      calories: 490,
      protein: 38,
      carbs: 35,
      fat: 20,
      ingredients: ['120g bœuf maigre', '200g légumes wok', '50g riz basmati', 'sauce soja'],
      instructions: 'Wok rapide avec le bœuf et les légumes, servir avec le riz.'
    },
    {
      name: 'Omelette complète et salade',
      calories: 460,
      protein: 35,
      carbs: 25,
      fat: 26,
      ingredients: ['3 œufs', '50g jambon', '30g fromage râpé', 'champignons', 'salade composée'],
      instructions: 'Préparer l\'omelette garnie, accompagner de la salade.'
    }
  ],
  snack: [
    {
      name: 'Fromage blanc et amandes',
      calories: 180,
      protein: 20,
      carbs: 12,
      fat: 8,
      ingredients: ['200g fromage blanc 0%', '15g amandes', 'cannelle'],
      instructions: 'Mélanger et déguster.'
    },
    {
      name: 'Shake protéiné maison',
      calories: 200,
      protein: 25,
      carbs: 18,
      fat: 5,
      ingredients: ['1 scoop whey', '1 banane', '200ml eau'],
      instructions: 'Mixer tous les ingrédients.'
    },
    {
      name: 'Tranches de pomme et beurre de cacahuète',
      calories: 190,
      protein: 8,
      carbs: 22,
      fat: 10,
      ingredients: ['1 pomme', '15g beurre de cacahuète naturel'],
      instructions: 'Couper la pomme, tartiner avec le beurre de cacahuète.'
    }
  ]
};

// Snacks anti-fringales (<200 cal, fort volume)
const antiCravingSnacks = [
  { name: 'Popcorn maison (sans sucre)', calories: 150, volume: 'high', description: '30g de maïs éclaté à l\'air' },
  { name: 'Concombre à volonté', calories: 50, volume: 'very high', description: '1 concombre entier avec citron' },
  { name: 'Gelée zéro calorie', calories: 10, volume: 'medium', description: 'Préparation avec édulcorant' },
  { name: 'Tomates cerises', calories: 80, volume: 'high', description: '250g de tomates cerises' },
  { name: 'Champignons grillés', calories: 70, volume: 'medium', description: '200g champignons avec herbes' },
  { name: 'Pastèque fraîche', calories: 120, volume: 'high', description: '400g de pastèque' },
  { name: 'Blanc de dinde roulé', calories: 100, volume: 'medium', description: '80g de blanc de dinde' },
  { name: 'Haricots verts vapeur', calories: 90, volume: 'high', description: '300g avec citron' },
  { name: 'Thé glacé sans sucre', calories: 5, volume: 'liquid', description: 'Grand verre avec menthe' },
  { name: 'Pickles / cornichons', calories: 40, volume: 'medium', description: '100g de pickles' }
];

// Phrases motivantes personnalisées
const motivationalQuotes = [
  "Chaque répétition compte. Chaque choix compte. Tu construis ta meilleure version.",
  "La discipline d'aujourd'hui est la force de demain.",
  "Tu n'as pas besoin d'être parfait, tu dois juste être constant.",
  "Ton corps peut tout supporter. C'est ton mental que tu dois convaincre.",
  "Les résultats viennent à ceux qui persistent quand les autres abandonnent.",
  "Un jour ou jour un. Choisis ton jour.",
  "La douleur temporaire crée la force permanente.",
  "Tu es plus fort que tes excuses.",
  "Chaque goutte de sueur est une promesse tenue envers toi-même.",
  "Le succès se construit dans les moments où personne ne regarde."
];

// Défis quotidiens pour la discipline
const dailyChallenges = [
  "Faire 10 pompes supplémentaires aujourd'hui",
  "Boire 500ml d'eau avant chaque repas",
  "Prendre les escaliers au lieu de l'ascenseur",
  "Marcher 10 minutes après chaque repas",
  "Tenir la planche 30 secondes de plus qu'hier",
  "Manger un légume vert à chaque repas",
  "Se coucher 30 minutes plus tôt ce soir",
  "Faire 5 minutes d'étirements matinales",
  "Écrire 3 choses positives de la journée",
  "Respirer profondément 10 fois avant chaque décision alimentaire"
];

// Affirmations fitness
const affirmations = [
  "Je suis capable de transformer mon corps et mon esprit",
  "Chaque jour, je deviens plus fort et plus sain",
  "Je mérite d'être en bonne santé et plein d'énergie",
  "Mes efforts d'aujourd'hui créent mon succès de demain",
  "J'ai le pouvoir de choisir la santé à chaque instant",
  "Mon corps est fort, capable et résilient",
  "Je suis fier des progrès que je fais, petit à petit",
  "La discipline est ma superpuissance",
  "Je transforme mes défis en opportunités de croissance",
  "Je suis le coach de ma propre vie"
];

// Générer le niveau de difficulté basé sur la semaine
const getDifficultyForWeek = (weekNumber) => {
  if (weekNumber <= 4) return 'beginner';
  if (weekNumber <= 8) return 'intermediate';
  return 'advanced';
};

// Générer un programme d'entraînement pour une semaine
const generateWeeklyWorkouts = (weekNumber, programId) => {
  const difficulty = getDifficultyForWeek(weekNumber);
  const exercises = exerciseLibrary[difficulty];
  const workouts = [];
  
  // Programme sur 4 jours (Lundi, Mercredi, Vendredi, Samedi)
  const workoutDays = [1, 3, 5, 6];
  
  workoutDays.forEach((day, index) => {
    // Sélectionner des exercices variés pour chaque séance
    const startIndex = (index * 3) % exercises.length;
    const selectedExercises = [
      exercises[startIndex],
      exercises[(startIndex + 1) % exercises.length],
      exercises[(startIndex + 2) % exercises.length],
      exercises[(startIndex + 3) % exercises.length],
      exercises[(startIndex + 4) % exercises.length]
    ];
    
    const workout = {
      id: `workout_${programId}_w${weekNumber}_d${day}`,
      program_id: programId,
      week: weekNumber,
      day: day,
      duration: 30 + (weekNumber * 1), // Progression de durée
      difficulty: difficulty,
      exercises: selectedExercises.map(e => ({
        ...e,
        sets: Math.min(e.sets + Math.floor(weekNumber / 4), 5), // Progression des sets
        rest: Math.max(e.rest - (weekNumber * 2), 30) // Réduction du repos
      }))
    };
    
    workouts.push(workout);
  });
  
  return workouts;
};

// Générer un plan de repas hebdomadaire
const generateWeeklyMeals = (weekNumber, programId, excludedFoods = []) => {
  const meals = [];
  const days = [0, 1, 2, 3, 4, 5, 6];
  
  days.forEach(day => {
    // Sélection aléatoire mais cohérente basée sur le jour
    const breakfastIndex = day % mealPlans.breakfast.length;
    const lunchIndex = day % mealPlans.lunch.length;
    const dinnerIndex = day % mealPlans.dinner.length;
    const snackIndex = day % mealPlans.snack.length;
    
    // Petit-déjeuner
    meals.push({
      id: `meal_${programId}_w${weekNumber}_d${day}_breakfast`,
      program_id: programId,
      week: weekNumber,
      day: day,
      type: 'breakfast',
      ...mealPlans.breakfast[breakfastIndex]
    });
    
    // Déjeuner
    meals.push({
      id: `meal_${programId}_w${weekNumber}_d${day}_lunch`,
      program_id: programId,
      week: weekNumber,
      day: day,
      type: 'lunch',
      ...mealPlans.lunch[lunchIndex]
    });
    
    // Dîner
    meals.push({
      id: `meal_${programId}_w${weekNumber}_d${day}_dinner`,
      program_id: programId,
      week: weekNumber,
      day: day,
      type: 'dinner',
      ...mealPlans.dinner[dinnerIndex]
    });
    
    // Collation
    meals.push({
      id: `meal_${programId}_w${weekNumber}_d${day}_snack`,
      program_id: programId,
      week: weekNumber,
      day: day,
      type: 'snack',
      ...mealPlans.snack[snackIndex]
    });
  });
  
  return meals;
};

// Générer la liste de courses pour une semaine
const generateShoppingList = (weeklyMeals) => {
  const ingredientMap = new Map();
  
  weeklyMeals.forEach(meal => {
    meal.ingredients.forEach(ingredient => {
      const current = ingredientMap.get(ingredient) || 0;
      ingredientMap.set(ingredient, current + 1);
    });
  });
  
  return Array.from(ingredientMap.entries()).map(([ingredient, count]) => ({
    ingredient,
    occurrences: count,
    category: categorizeIngredient(ingredient)
  })).sort((a, b) => a.category.localeCompare(b.category));
};

// Catégoriser les ingrédients pour la liste de courses
const categorizeIngredient = (ingredient) => {
  const lower = ingredient.toLowerCase();
  if (lower.includes('œuf') || lower.includes('lait') || lower.includes('fromage') || lower.includes('yaourt')) return 'Produits laitiers';
  if (lower.includes('poulet') || lower.includes('bœuf') || lower.includes('dinde') || lower.includes('thon') || lower.includes('saumon')) return 'Protéines';
  if (lower.includes('pain') || lower.includes('riz') || lower.includes('quinoa') || lower.includes('pâtes') || lower.includes('avoine')) return 'Féculents';
  if (lower.includes('épinard') || lower.includes('brocoli') || lower.includes('légume') || lower.includes('tomate') || lower.includes('concombre')) return 'Légumes';
  if (lower.includes('pomme') || lower.includes('banane') || lower.includes('fruit')) return 'Fruits';
  if (lower.includes('huile') || lower.includes('amande') || lower.includes('cacahuète') || lower.includes('avocat')) return 'Bonnes graisses';
  return 'Autres';
};

// Routine matinale quotidienne
const generateMorningRoutine = (user, dayOfWeek) => {
  const isWorkoutDay = [1, 3, 5, 6].includes(dayOfWeek);
  
  return {
    duration: 30,
    components: [
      {
        type: 'hydration',
        action: 'Boire 500ml d\'eau tiède avec citron',
        duration: 2
      },
      {
        type: 'mindfulness',
        action: '2 minutes de respiration profonde',
        duration: 2
      },
      ...(isWorkoutDay ? [{
        type: 'workout',
        action: 'Séance d\'entraînement du jour',
        duration: 20
      }] : [{
        type: 'movement',
        action: 'Étirements dynamiques et marche sur place',
        duration: 10
      }]),
      {
        type: 'nutrition',
        action: 'Préparer et prendre le petit-déjeuner',
        duration: isWorkoutDay ? 6 : 8
      }
    ],
    dailyChallenge: dailyChallenges[dayOfWeek % dailyChallenges.length],
    motivationalQuote: motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  };
};

// Script anti-fringale
const getAntiCravingScript = () => {
  return {
    steps: [
      "🛑 STOP - Pause de 30 secondes avant d'agir",
      "💧 Bois un grand verre d'eau maintenant",
      "🤔 Demande-toi: Ai-je vraiment faim ou est-ce une émotion?",
      "⏰ Attends 10 minutes en faisant autre chose",
      "🍎 Si l'envie persiste, choisis un snack de la liste anti-fringales",
      "📝 Note ce que tu ressens dans ton journal"
    ],
    mantra: "Cette envie est temporaire. Je suis plus fort que cette impulsion. Mon objectif vaut plus que ce plaisir momentané."
  };
};

export {
  exerciseLibrary,
  mealPlans,
  antiCravingSnacks,
  motivationalQuotes,
  dailyChallenges,
  affirmations,
  getDifficultyForWeek,
  generateWeeklyWorkouts,
  generateWeeklyMeals,
  generateShoppingList,
  generateMorningRoutine,
  getAntiCravingScript
};
