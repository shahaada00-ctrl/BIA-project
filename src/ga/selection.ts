import { RecommendationSet } from '../types';

/**
 * Tournament selection: randomly pick `tournamentSize` individuals from the
 * population and return the one with the highest fitness score.
 *
 * @param population - The current population of recommendation sets (must have length >= 1).
 * @param tournamentSize - Number of individuals to sample for each tournament (clamped to population size).
 * @returns The recommendation set with the highest fitness score among the tournament participants.
 */
export function tournamentSelection(
  population: RecommendationSet[],
  tournamentSize: number
): RecommendationSet {
  if (population.length === 0) {
    throw new Error('Population must not be empty');
  }

  // Clamp tournament size to population size
  const effectiveSize = Math.min(Math.max(1, tournamentSize), population.length);

  // Build an array of indices and shuffle to sample without replacement
  const indices = Array.from({ length: population.length }, (_, i) => i);
  // Fisher-Yates partial shuffle for the first `effectiveSize` elements
  for (let i = 0; i < effectiveSize; i++) {
    const j = i + Math.floor(Math.random() * (indices.length - i));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  let best: RecommendationSet = population[indices[0]];
  for (let i = 1; i < effectiveSize; i++) {
    const candidate = population[indices[i]];
    if (candidate.fitnessScore > best.fitnessScore) {
      best = candidate;
    }
  }

  return best;
}

/**
 * Select two distinct parents from the population using tournament selection.
 *
 * Keeps selecting the second parent until it differs from the first (by reference
 * or by fitness score). Falls back after a maximum number of attempts to avoid
 * infinite loops when the population has identical individuals.
 *
 * @param population - The current population (must have length >= 2).
 * @param tournamentSize - Tournament size for each selection.
 * @returns A tuple of two parent recommendation sets.
 */
export function selectParents(
  population: RecommendationSet[],
  tournamentSize: number
): [RecommendationSet, RecommendationSet] {
  if (population.length < 2) {
    throw new Error('Population must have at least 2 individuals to select parents');
  }

  const parent1 = tournamentSelection(population, tournamentSize);

  const maxAttempts = 20;
  let parent2: RecommendationSet = parent1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    parent2 = tournamentSelection(population, tournamentSize);
    // Consider parents distinct if they are different objects or have different product sets
    if (parent2 !== parent1 || parent2.productIds !== parent1.productIds) {
      break;
    }
  }

  return [parent1, parent2];
}
