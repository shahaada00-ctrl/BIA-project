// ============================================================
// Data Models
// ============================================================

export interface User {
  user_id: number;
  age: number;
  location: string;
}

export interface Product {
  product_id: number;
  category: string;
  price: number;
}

export interface Rating {
  user_id: number;
  product_id: number;
  rating: number; // 1–5
}

export interface BehaviorRecord {
  user_id: number;
  product_id: number;
  viewed: number;   // 0 or 1, or count
  clicked: number;  // 0 or 1, or count
  purchased: number; // 0 or 1, or count
}

export interface UserProfile {
  user: User;
  ratings: Rating[];
  behavior: BehaviorRecord[];
  ratingCount: number;
  behaviorCount: number;
  topRatedProducts: { product_id: number; rating: number }[]; // top 5
}

export interface RecommendationSet {
  productIds: number[];
  fitnessScore: number;
}

// ============================================================
// Genetic Algorithm Configuration
// ============================================================

export interface FitnessWeights {
  rating: number;   // default 0.3
  view: number;     // default 0.1
  click: number;    // default 0.3
  purchase: number; // default 0.3
}

export interface GAConfig {
  populationSize: number;       // default 20
  productsPerSet: number;       // default 10
  maxGenerations: number;       // default 50
  crossoverRate: number;        // default 0.8
  mutationRate: number;         // default 0.1
  tournamentSize: number;       // default 3
  convergenceThreshold: number; // default 0.001
  convergencePatience: number;  // default 10
  fitnessWeights: FitnessWeights;
}

// ============================================================
// GA Execution Results
// ============================================================

export interface GenerationStats {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  bestSet: number[]; // product_ids
}

export interface GAResult {
  finalBestSet: RecommendationSet;
  generationHistory: GenerationStats[];
  totalGenerations: number;
  converged: boolean;
  fitnessImprovement: number; // percentage
}

// ============================================================
// Web Worker Message Protocol
// ============================================================

/** Messages from main thread to worker */
export type WorkerInMessage = {
  type: 'start';
  payload: {
    config: GAConfig;
    userId: number;
    products: Product[];
    ratings: Rating[];
    behavior: BehaviorRecord[];
  };
};

/** Messages from worker to main thread */
export type WorkerOutMessage =
  | { type: 'generation-complete'; payload: GenerationStats }
  | { type: 'complete'; payload: GAResult }
  | { type: 'error'; payload: { message: string } };

// ============================================================
// Default Values
// ============================================================

export const DEFAULT_FITNESS_WEIGHTS: FitnessWeights = {
  rating: 0.3,
  view: 0.1,
  click: 0.3,
  purchase: 0.3,
};

export const DEFAULT_GA_CONFIG: GAConfig = {
  populationSize: 20,
  productsPerSet: 10,
  maxGenerations: 50,
  crossoverRate: 0.8,
  mutationRate: 0.1,
  tournamentSize: 3,
  convergenceThreshold: 0.001,
  convergencePatience: 10,
  fitnessWeights: { ...DEFAULT_FITNESS_WEIGHTS },
};
