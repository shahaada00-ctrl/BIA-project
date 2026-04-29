import { RecommendationSet } from '../types';

/**
 * Single-point crossover: combine two parent recommendation sets at a random
 * crossover point to produce two offspring.
 *
 * 1. Pick a random crossover point in [1, length - 1].
 * 2. offspring1 = parent1[0..point] + parent2[point..end]
 * 3. offspring2 = parent2[0..point] + parent1[point..end]
 * 4. Replace any duplicate product IDs in each offspring with random products
 *    from allProductIds that aren't already in the offspring.
 * 5. Return both offspring with fitnessScore = 0.
 *
 * The crossover rate is applied externally (in the GA engine), so this function
 * always performs the crossover when called.
 *
 * @param parent1 - First parent recommendation set.
 * @param parent2 - Second parent recommendation set.
 * @param allProductIds - Full product catalog IDs to draw replacements from.
 * @returns A tuple of two offspring recommendation sets.
 */
export function singlePointCrossover(
  parent1: RecommendationSet,
  parent2: RecommendationSet,
  allProductIds: number[]
): [RecommendationSet, RecommendationSet] {
  const len = parent1.productIds.length;

  // Pick a crossover point in [1, len - 1] so both parents contribute
  const crossoverPoint = 1 + Math.floor(Math.random() * (len - 1));

  // Build raw offspring by slicing at the crossover point
  const raw1 = [
    ...parent1.productIds.slice(0, crossoverPoint),
    ...parent2.productIds.slice(crossoverPoint),
  ];
  const raw2 = [
    ...parent2.productIds.slice(0, crossoverPoint),
    ...parent1.productIds.slice(crossoverPoint),
  ];

  // Deduplicate each offspring, replacing duplicates with random catalog products
  const offspring1Ids = removeDuplicates(raw1, allProductIds);
  const offspring2Ids = removeDuplicates(raw2, allProductIds);

  return [
    { productIds: offspring1Ids, fitnessScore: 0 },
    { productIds: offspring2Ids, fitnessScore: 0 },
  ];
}

/**
 * Walk through `ids` left-to-right, keeping the first occurrence of each product.
 * When a duplicate is found, replace it with a random product from `catalog`
 * that is not already present in the result set.
 */
function removeDuplicates(ids: number[], catalog: number[]): number[] {
  const seen = new Set<number>();
  const result: number[] = [];

  for (const id of ids) {
    if (!seen.has(id)) {
      seen.add(id);
      result.push(id);
    } else {
      // Find a replacement from the catalog that isn't already used
      const replacement = pickRandom(catalog, seen);
      seen.add(replacement);
      result.push(replacement);
    }
  }

  return result;
}

/**
 * Pick a random product ID from `catalog` that is not in `exclude`.
 * Uses rejection sampling for efficiency when the catalog is large relative
 * to the exclude set.
 */
function pickRandom(catalog: number[], exclude: Set<number>): number {
  // Build candidates list (filter approach — safe for any catalog size)
  const candidates = catalog.filter((id) => !exclude.has(id));
  if (candidates.length === 0) {
    throw new Error('No available products to replace duplicate');
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}
