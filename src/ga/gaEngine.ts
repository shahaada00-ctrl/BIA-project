import {
  GAConfig,
  Product,
  Rating,
  BehaviorRecord,
  RecommendationSet,
  GenerationStats,
  GAResult,
} from '../types';
import { evaluateFitness } from './fitness';
import { selectParents } from './selection';
import { singlePointCrossover } from './crossover';
import { mutate } from './mutation';

/**
 * Generate an initial population of random recommendation sets.
 * Each set contains `productsPerSet` unique product IDs drawn from the catalog.
 */
export function generateInitialPopulation(
  populationSize: number,
  productsPerSet: number,
  allProductIds: number[]
): RecommendationSet[] {
  const population: RecommendationSet[] = [];

  for (let i = 0; i < populationSize; i++) {
    const shuffled = [...allProductIds];
    // Fisher-Yates shuffle (partial — only need first productsPerSet elements)
    for (let j = 0; j < productsPerSet; j++) {
      const k = j + Math.floor(Math.random() * (shuffled.length - j));
      [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
    }
    population.push({
      productIds: shuffled.slice(0, productsPerSet),
      fitnessScore: 0,
    });
  }

  return population;
}

/**
 * Check whether the GA has converged: best fitness hasn't improved by more than
 * `convergenceThreshold` for `convergencePatience` consecutive generations.
 */
export function hasConverged(
  history: GenerationStats[],
  convergenceThreshold: number,
  convergencePatience: number
): boolean {
  if (history.length < convergencePatience + 1) {
    return false;
  }

  const recent = history.slice(-convergencePatience);
  const baseline = history[history.length - convergencePatience - 1].bestFitness;

  return recent.every(
    (stats) => Math.abs(stats.bestFitness - baseline) <= convergenceThreshold
  );
}

/**
 * Run the full genetic algorithm.
 *
 * @param config - GA configuration parameters
 * @param userId - Target user ID for fitness evaluation
 * @param products - Full product catalog
 * @param ratings - All rating records
 * @param behaviors - All behavior records
 * @param onGeneration - Optional callback invoked after each generation with stats
 * @returns GAResult with final best set, history, convergence status, and improvement
 */
export function runGA(
  config: GAConfig,
  userId: number,
  products: Product[],
  ratings: Rating[],
  behaviors: BehaviorRecord[],
  onGeneration?: (stats: GenerationStats) => void
): GAResult {
  const allProductIds = products.map((p) => p.product_id);

  // Build lookup maps (key format: "userId-productId")
  const ratingsMap = new Map<string, number>();
  for (const r of ratings) {
    ratingsMap.set(`${r.user_id}-${r.product_id}`, r.rating);
  }

  const behaviorMap = new Map<string, BehaviorRecord>();
  for (const b of behaviors) {
    behaviorMap.set(`${b.user_id}-${b.product_id}`, b);
  }

  // Generate initial population
  let population = generateInitialPopulation(
    config.populationSize,
    config.productsPerSet,
    allProductIds
  );

  const generationHistory: GenerationStats[] = [];
  let initialBestFitness = 0;

  for (let gen = 0; gen < config.maxGenerations; gen++) {
    // Evaluate fitness for all sets
    for (const individual of population) {
      individual.fitnessScore = evaluateFitness(
        individual,
        userId,
        ratingsMap,
        behaviorMap,
        config.fitnessWeights
      );
    }

    // Find best and compute average
    let bestIndividual = population[0];
    let totalFitness = 0;
    for (const individual of population) {
      totalFitness += individual.fitnessScore;
      if (individual.fitnessScore > bestIndividual.fitnessScore) {
        bestIndividual = individual;
      }
    }

    const avgFitness = totalFitness / population.length;

    const stats: GenerationStats = {
      generation: gen,
      bestFitness: bestIndividual.fitnessScore,
      avgFitness,
      bestSet: [...bestIndividual.productIds],
    };

    generationHistory.push(stats);

    if (gen === 0) {
      initialBestFitness = bestIndividual.fitnessScore;
    }

    // Notify progress
    if (onGeneration) {
      onGeneration(stats);
    }

    // Check convergence
    if (hasConverged(generationHistory, config.convergenceThreshold, config.convergencePatience)) {
      const finalBest = findGlobalBest(population, generationHistory);
      return {
        finalBestSet: finalBest,
        generationHistory,
        totalGenerations: gen + 1,
        converged: true,
        fitnessImprovement: computeImprovement(initialBestFitness, finalBest.fitnessScore),
      };
    }

    // Create next generation
    const nextPopulation: RecommendationSet[] = [];

    while (nextPopulation.length < config.populationSize) {
      const [parent1, parent2] = selectParents(population, config.tournamentSize);

      let offspring1: RecommendationSet;
      let offspring2: RecommendationSet;

      if (Math.random() < config.crossoverRate) {
        [offspring1, offspring2] = singlePointCrossover(parent1, parent2, allProductIds);
      } else {
        offspring1 = { productIds: [...parent1.productIds], fitnessScore: 0 };
        offspring2 = { productIds: [...parent2.productIds], fitnessScore: 0 };
      }

      offspring1 = mutate(offspring1, config.mutationRate, allProductIds);
      offspring2 = mutate(offspring2, config.mutationRate, allProductIds);

      nextPopulation.push(offspring1);
      if (nextPopulation.length < config.populationSize) {
        nextPopulation.push(offspring2);
      }
    }

    population = nextPopulation;
  }

  // Evaluate final generation fitness
  for (const individual of population) {
    individual.fitnessScore = evaluateFitness(
      individual,
      userId,
      ratingsMap,
      behaviorMap,
      config.fitnessWeights
    );
  }

  const finalBest = findGlobalBest(population, generationHistory);

  return {
    finalBestSet: finalBest,
    generationHistory,
    totalGenerations: config.maxGenerations,
    converged: false,
    fitnessImprovement: computeImprovement(initialBestFitness, finalBest.fitnessScore),
  };
}

/**
 * Find the global best individual across the current population and all
 * recorded generation history.
 */
function findGlobalBest(
  population: RecommendationSet[],
  history: GenerationStats[]
): RecommendationSet {
  let bestFitness = -1;
  let bestSet: RecommendationSet = population[0];

  for (const individual of population) {
    if (individual.fitnessScore > bestFitness) {
      bestFitness = individual.fitnessScore;
      bestSet = individual;
    }
  }

  // Also check history in case an earlier generation had a better individual
  for (const stats of history) {
    if (stats.bestFitness > bestFitness) {
      bestFitness = stats.bestFitness;
      bestSet = { productIds: [...stats.bestSet], fitnessScore: stats.bestFitness };
    }
  }

  return { productIds: [...bestSet.productIds], fitnessScore: bestFitness };
}

/**
 * Compute fitness improvement percentage.
 * Returns ((final - initial) / initial) * 100 when initial > 0, or 0 otherwise.
 */
export function computeImprovement(initialFitness: number, finalFitness: number): number {
  if (initialFitness <= 0) {
    return 0;
  }
  return ((finalFitness - initialFitness) / initialFitness) * 100;
}
