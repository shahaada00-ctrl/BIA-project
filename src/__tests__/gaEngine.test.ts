import { describe, it, expect } from 'vitest';
import {
  generateInitialPopulation,
  hasConverged,
  runGA,
  computeImprovement,
} from '../ga/gaEngine';
import {
  GAConfig,
  GenerationStats,
  Product,
  Rating,
  BehaviorRecord,
  DEFAULT_GA_CONFIG,
} from '../types';

// ---------------------------------------------------------------------------
// Helper: build a small product catalog
// ---------------------------------------------------------------------------
function makeProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => ({
    product_id: i + 1,
    category: `cat-${(i % 3) + 1}`,
    price: 10 + i,
  }));
}

function makeRatings(userId: number, productIds: number[]): Rating[] {
  return productIds.map((pid) => ({
    user_id: userId,
    product_id: pid,
    rating: 3, // neutral rating
  }));
}

function makeBehavior(userId: number, productIds: number[]): BehaviorRecord[] {
  return productIds.map((pid) => ({
    user_id: userId,
    product_id: pid,
    viewed: 1,
    clicked: 1,
    purchased: 0,
  }));
}

// ---------------------------------------------------------------------------
// generateInitialPopulation
// ---------------------------------------------------------------------------
describe('generateInitialPopulation', () => {
  it('creates the correct number of individuals', () => {
    const pop = generateInitialPopulation(10, 5, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(pop).toHaveLength(10);
  });

  it('each individual has the correct number of products', () => {
    const pop = generateInitialPopulation(5, 4, [1, 2, 3, 4, 5, 6, 7, 8]);
    for (const ind of pop) {
      expect(ind.productIds).toHaveLength(4);
    }
  });

  it('no individual contains duplicate product IDs', () => {
    const pop = generateInitialPopulation(20, 8, Array.from({ length: 20 }, (_, i) => i + 1));
    for (const ind of pop) {
      const unique = new Set(ind.productIds);
      expect(unique.size).toBe(ind.productIds.length);
    }
  });

  it('all product IDs come from the catalog', () => {
    const catalog = [10, 20, 30, 40, 50];
    const pop = generateInitialPopulation(5, 3, catalog);
    const catalogSet = new Set(catalog);
    for (const ind of pop) {
      for (const pid of ind.productIds) {
        expect(catalogSet.has(pid)).toBe(true);
      }
    }
  });

  it('initializes fitness scores to 0', () => {
    const pop = generateInitialPopulation(3, 2, [1, 2, 3, 4]);
    for (const ind of pop) {
      expect(ind.fitnessScore).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// hasConverged
// ---------------------------------------------------------------------------
describe('hasConverged', () => {
  it('returns false when history is shorter than patience + 1', () => {
    const history: GenerationStats[] = [
      { generation: 0, bestFitness: 0.5, avgFitness: 0.3, bestSet: [1] },
      { generation: 1, bestFitness: 0.5, avgFitness: 0.3, bestSet: [1] },
    ];
    expect(hasConverged(history, 0.001, 3)).toBe(false);
  });

  it('returns true when best fitness stagnates for patience generations', () => {
    const history: GenerationStats[] = [
      { generation: 0, bestFitness: 0.5, avgFitness: 0.3, bestSet: [1] },
      { generation: 1, bestFitness: 0.5, avgFitness: 0.3, bestSet: [1] },
      { generation: 2, bestFitness: 0.5, avgFitness: 0.3, bestSet: [1] },
      { generation: 3, bestFitness: 0.5, avgFitness: 0.3, bestSet: [1] },
    ];
    expect(hasConverged(history, 0.001, 3)).toBe(true);
  });

  it('returns false when fitness is still improving', () => {
    const history: GenerationStats[] = [
      { generation: 0, bestFitness: 0.3, avgFitness: 0.2, bestSet: [1] },
      { generation: 1, bestFitness: 0.4, avgFitness: 0.3, bestSet: [1] },
      { generation: 2, bestFitness: 0.5, avgFitness: 0.4, bestSet: [1] },
      { generation: 3, bestFitness: 0.6, avgFitness: 0.5, bestSet: [1] },
    ];
    expect(hasConverged(history, 0.001, 3)).toBe(false);
  });

  it('considers threshold when checking stagnation', () => {
    const history: GenerationStats[] = [
      { generation: 0, bestFitness: 0.5, avgFitness: 0.3, bestSet: [1] },
      { generation: 1, bestFitness: 0.5005, avgFitness: 0.3, bestSet: [1] },
      { generation: 2, bestFitness: 0.5003, avgFitness: 0.3, bestSet: [1] },
      { generation: 3, bestFitness: 0.5008, avgFitness: 0.3, bestSet: [1] },
    ];
    // All within 0.001 of baseline (0.5)
    expect(hasConverged(history, 0.001, 3)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// computeImprovement
// ---------------------------------------------------------------------------
describe('computeImprovement', () => {
  it('computes correct percentage improvement', () => {
    expect(computeImprovement(0.5, 0.75)).toBeCloseTo(50, 5);
  });

  it('returns 0 when initial fitness is 0', () => {
    expect(computeImprovement(0, 0.5)).toBe(0);
  });

  it('returns 0 when initial fitness is negative', () => {
    expect(computeImprovement(-1, 0.5)).toBe(0);
  });

  it('returns 100 when fitness doubles', () => {
    expect(computeImprovement(0.3, 0.6)).toBeCloseTo(100, 5);
  });

  it('handles no improvement', () => {
    expect(computeImprovement(0.5, 0.5)).toBeCloseTo(0, 5);
  });
});

// ---------------------------------------------------------------------------
// runGA (integration)
// ---------------------------------------------------------------------------
describe('runGA', () => {
  const userId = 1;
  const products = makeProducts(30);
  const allProductIds = products.map((p) => p.product_id);
  const ratings = makeRatings(userId, allProductIds.slice(0, 15));
  const behaviors = makeBehavior(userId, allProductIds.slice(0, 15));

  const smallConfig: GAConfig = {
    ...DEFAULT_GA_CONFIG,
    populationSize: 10,
    productsPerSet: 5,
    maxGenerations: 10,
    convergencePatience: 5,
  };

  it('returns a result with correct structure', () => {
    const result = runGA(smallConfig, userId, products, ratings, behaviors);
    expect(result.finalBestSet).toBeDefined();
    expect(result.finalBestSet.productIds).toHaveLength(smallConfig.productsPerSet);
    expect(result.generationHistory).toBeDefined();
    expect(result.totalGenerations).toBeGreaterThan(0);
    expect(result.totalGenerations).toBeLessThanOrEqual(smallConfig.maxGenerations);
    expect(typeof result.converged).toBe('boolean');
    expect(typeof result.fitnessImprovement).toBe('number');
  });

  it('respects maxGenerations limit', () => {
    const result = runGA(smallConfig, userId, products, ratings, behaviors);
    expect(result.totalGenerations).toBeLessThanOrEqual(smallConfig.maxGenerations);
    expect(result.generationHistory.length).toBe(result.totalGenerations);
  });

  it('generation history has sequential generation numbers', () => {
    const result = runGA(smallConfig, userId, products, ratings, behaviors);
    for (let i = 0; i < result.generationHistory.length; i++) {
      expect(result.generationHistory[i].generation).toBe(i);
    }
  });

  it('final best fitness >= all generation best fitnesses', () => {
    const result = runGA(smallConfig, userId, products, ratings, behaviors);
    for (const stats of result.generationHistory) {
      expect(result.finalBestSet.fitnessScore).toBeGreaterThanOrEqual(
        stats.bestFitness - 1e-10 // small epsilon for floating point
      );
    }
  });

  it('calls onGeneration callback for each generation', () => {
    const callbacks: GenerationStats[] = [];
    runGA(smallConfig, userId, products, ratings, behaviors, (stats) => {
      callbacks.push(stats);
    });
    expect(callbacks.length).toBeGreaterThan(0);
    expect(callbacks.length).toBeLessThanOrEqual(smallConfig.maxGenerations);
  });

  it('no duplicate products in final best set', () => {
    const result = runGA(smallConfig, userId, products, ratings, behaviors);
    const unique = new Set(result.finalBestSet.productIds);
    expect(unique.size).toBe(result.finalBestSet.productIds.length);
  });

  it('detects convergence when fitness stagnates', () => {
    // Use a config with very low patience and a user with no data
    // so fitness is always 0 → immediate stagnation
    const convergenceConfig: GAConfig = {
      ...DEFAULT_GA_CONFIG,
      populationSize: 6,
      productsPerSet: 3,
      maxGenerations: 50,
      convergencePatience: 3,
      convergenceThreshold: 0.001,
    };
    const noDataProducts = makeProducts(20);
    const result = runGA(convergenceConfig, 999, noDataProducts, [], []);
    // With no interaction data, all fitness = 0, so should converge
    expect(result.converged).toBe(true);
    expect(result.totalGenerations).toBeLessThan(convergenceConfig.maxGenerations);
  });

  it('fitness improvement is 0 when initial fitness is 0', () => {
    const noDataConfig: GAConfig = {
      ...DEFAULT_GA_CONFIG,
      populationSize: 6,
      productsPerSet: 3,
      maxGenerations: 5,
      convergencePatience: 10,
    };
    const noDataProducts = makeProducts(20);
    const result = runGA(noDataConfig, 999, noDataProducts, [], []);
    expect(result.fitnessImprovement).toBe(0);
  });
});
