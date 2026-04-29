import { RecommendationSet } from '../types';

/**
 * Mutate a recommendation set by randomly replacing products at each position
 * with probability `mutationRate`.
 *
 * For each position in the set, a random number is drawn. If it is less than
 * `mutationRate`, the product at that position is replaced with a random product
 * from `allProductIds` that is not already present in the set.
 *
 * Returns a new RecommendationSet with fitnessScore = 0.
 *
 * @param set - The recommendation set to mutate.
 * @param mutationRate - Probability of mutating each position (0.0–1.0).
 * @param allProductIds - Full product catalog IDs to draw replacements from.
 * @returns A new (possibly mutated) RecommendationSet.
 */
export function mutate(
  set: RecommendationSet,
  mutationRate: number,
  allProductIds: number[]
): RecommendationSet {
  const mutated = [...set.productIds];
  const current = new Set(mutated);

  for (let i = 0; i < mutated.length; i++) {
    if (Math.random() < mutationRate) {
      // Find candidates not already in the set
      const candidates = allProductIds.filter((id) => !current.has(id));
      if (candidates.length === 0) {
        // No available replacements — skip this position
        continue;
      }
      const replacement = candidates[Math.floor(Math.random() * candidates.length)];

      // Remove old product from tracking, add new one
      current.delete(mutated[i]);
      current.add(replacement);
      mutated[i] = replacement;
    }
  }

  return { productIds: mutated, fitnessScore: 0 };
}
