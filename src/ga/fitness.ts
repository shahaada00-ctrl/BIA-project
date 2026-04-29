import { RecommendationSet, FitnessWeights, BehaviorRecord } from '../types';

/**
 * Evaluate the fitness of a recommendation set for a given user.
 *
 * Computes a weighted sum of average rating, view, click, and purchase scores
 * across all products in the set, normalized to [0.0, 1.0].
 *
 * Products with no interaction data for the target user contribute 0.0.
 *
 * The ratings map key format is "userId-productId" → rating value (1–5).
 * The behavior map key format is "userId-productId" → BehaviorRecord.
 *
 * @returns A fitness score in the range [0.0, 1.0].
 */
export function evaluateFitness(
  set: RecommendationSet,
  userId: number,
  ratings: Map<string, number>,
  behavior: Map<string, BehaviorRecord>,
  weights: FitnessWeights
): number {
  const { productIds } = set;

  if (productIds.length === 0) {
    return 0.0;
  }

  let totalRatingScore = 0;
  let totalViewScore = 0;
  let totalClickScore = 0;
  let totalPurchaseScore = 0;

  for (const productId of productIds) {
    const key = `${userId}-${productId}`;

    // Rating score: normalize from 1-5 range to 0-1 by dividing by 5
    const rating = ratings.get(key);
    if (rating !== undefined) {
      totalRatingScore += rating / 5;
    }
    // No interaction data → 0.0 contribution (already 0)

    // Behavior scores: viewed, clicked, purchased are 0/1 (or counts)
    // Clamp to [0, 1] to ensure normalization
    const beh = behavior.get(key);
    if (beh !== undefined) {
      totalViewScore += Math.min(beh.viewed, 1);
      totalClickScore += Math.min(beh.clicked, 1);
      totalPurchaseScore += Math.min(beh.purchased, 1);
    }
    // No behavior data → 0.0 contribution (already 0)
  }

  const count = productIds.length;

  // Average scores across all products in the set
  const avgRating = totalRatingScore / count;
  const avgView = totalViewScore / count;
  const avgClick = totalClickScore / count;
  const avgPurchase = totalPurchaseScore / count;

  // Weighted sum
  const weightSum = weights.rating + weights.view + weights.click + weights.purchase;

  if (weightSum === 0) {
    return 0.0;
  }

  const rawScore =
    weights.rating * avgRating +
    weights.view * avgView +
    weights.click * avgClick +
    weights.purchase * avgPurchase;

  // Normalize by dividing by weight sum to ensure result is in [0.0, 1.0]
  const normalized = rawScore / weightSum;

  // Clamp to [0.0, 1.0] for safety
  return Math.max(0.0, Math.min(1.0, normalized));
}
