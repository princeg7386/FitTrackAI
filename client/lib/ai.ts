export type UserGoals = {
  goal: "lose_weight" | "build_muscle" | "improve_endurance" | "general_health";
  weeklyTargetMinutes?: number;
};

export type DailyStats = {
  steps: number;
  avgHeartRate: number;
  sleepMinutes: number;
  calories: number;
};

export type Recommendation = {
  workouts: string[];
  diet: string[];
  hydrationLiters: number;
  reasoning: string[];
  confidence: number; // 0..1
};

export function generateRecommendations(stats: DailyStats, goals: UserGoals): Recommendation {
  const reasoning: string[] = [];
  let confidence = 0.7;
  const workouts: string[] = [];
  const diet: string[] = [];

  // Sleep
  if (stats.sleepMinutes < 420) {
    reasoning.push("Sleep below 7h — prioritize recovery");
    workouts.push("Low‑intensity 30–40 min zone‑2 cardio");
    confidence -= 0.05;
  } else {
    workouts.push("Moderate‑intensity 45–60 min session");
  }

  // Heart rate
  if (stats.avgHeartRate > 85) {
    reasoning.push("Elevated avg HR — keep intensity moderate");
    workouts.push("Breathing drills + mobility 10 min");
  }

  // Steps
  if (stats.steps < 8000) {
    workouts.push("Walk 6–8k steps (break into short bouts)");
  } else {
    workouts.push("Add 15 min brisk walk post‑meal");
  }

  // Goal specific
  switch (goals.goal) {
    case "lose_weight":
      diet.push("High‑protein (1.6–2.2g/kg), calorie deficit ~10–15%", "Fiber‑rich veggies, limit liquid calories");
      workouts.push("Full‑body circuit x3, RPE 6–7");
      break;
    case "build_muscle":
      diet.push("Slight surplus 5–10%, 1.8–2.2g/kg protein", "Carbs around training");
      workouts.push("Compound lifts 5x5, accessory hypertrophy");
      break;
    case "improve_endurance":
      diet.push("Carb periodization for long sessions", "Electrolytes during >60 min workouts");
      workouts.push("Zone‑2 45 min + intervals 6x2 min");
      break;
    default:
      diet.push("Balanced plate: 40% carbs, 30% protein, 30% fats");
      workouts.push("3× weekly strength + daily walks");
  }

  // Hydration
  const hydrationLiters = Math.max(1.8, Math.min(3.5, 2 + (stats.steps - 6000) / 6000));

  // Normalize confidence
  confidence = Math.min(0.95, Math.max(0.5, confidence));

  return { workouts, diet, hydrationLiters: Number(hydrationLiters.toFixed(1)), reasoning, confidence };
}
