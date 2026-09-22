export type MealType =
  | 'pequeno_almoco'
  | 'almoco'
  | 'lanche'
  | 'jantar'
  | 'ceia'
  | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEntry {
  id: string;
  mealType: MealType;
  name: string;
  loggedAt: string; // ISO string
  items: FoodItem[];
  totals: MealTotals;
  notes?: string;
  adheresToPlateRule?: boolean; // 1/2 veggies, 1/4 carbs, 1/4 protein
}

export interface DailyHabits {
  waterMl: number; // Target: 2000 ml
  sodaCount: number; // Target: max 1 per day
}

export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  maxSoda: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: MealEntry[];
  dayTotals: MealTotals;
  habits: DailyHabits;
  updatedAt: string;
}

export interface NutritionPlanMealOption {
  optionNumber: number;
  title?: string;
  items: string[];
}

export interface NutritionPlanMeal {
  mealType: MealType;
  label: string;
  recommendedTime: string;
  options: NutritionPlanMealOption[];
  rulesNotes?: string[];
}

export interface NutritionPlan {
  id: string;
  title: string;
  date: string;
  markdownContent: string;
  meals: NutritionPlanMeal[];
  commitments: string[];
  rules: string[];
  fruitEquivalencies: Array<{ fruit: string; portion: string }>;
  updatedAt: string;
}
