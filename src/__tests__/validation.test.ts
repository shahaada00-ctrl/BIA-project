import { describe, it, expect } from 'vitest';
import { validateGAConfig } from '../validation';
import { DEFAULT_GA_CONFIG } from '../types';
import type { GAConfig } from '../types';

function makeConfig(overrides: Partial<GAConfig> = {}): GAConfig {
  return { ...DEFAULT_GA_CONFIG, fitnessWeights: { ...DEFAULT_GA_CONFIG.fitnessWeights }, ...overrides };
}

describe('validateGAConfig', () => {
  it('returns empty object for valid default config', () => {
    expect(validateGAConfig(DEFAULT_GA_CONFIG)).toEqual({});
  });

  // Population size
  it('rejects population size of 0', () => {
    const errors = validateGAConfig(makeConfig({ populationSize: 0 }));
    expect(errors.populationSize).toBeDefined();
  });

  it('rejects negative population size', () => {
    const errors = validateGAConfig(makeConfig({ populationSize: -5 }));
    expect(errors.populationSize).toBeDefined();
  });

  it('accepts population size of 1', () => {
    const errors = validateGAConfig(makeConfig({ populationSize: 1 }));
    expect(errors.populationSize).toBeUndefined();
  });

  // Products per set
  it('rejects products per set of 0', () => {
    const errors = validateGAConfig(makeConfig({ productsPerSet: 0 }));
    expect(errors.productsPerSet).toBeDefined();
  });

  it('rejects negative products per set', () => {
    const errors = validateGAConfig(makeConfig({ productsPerSet: -1 }));
    expect(errors.productsPerSet).toBeDefined();
  });

  // Max generations
  it('rejects max generations of 0', () => {
    const errors = validateGAConfig(makeConfig({ maxGenerations: 0 }));
    expect(errors.maxGenerations).toBeDefined();
  });

  it('rejects negative max generations', () => {
    const errors = validateGAConfig(makeConfig({ maxGenerations: -10 }));
    expect(errors.maxGenerations).toBeDefined();
  });

  // Crossover rate
  it('rejects crossover rate above 1', () => {
    const errors = validateGAConfig(makeConfig({ crossoverRate: 1.1 }));
    expect(errors.crossoverRate).toBeDefined();
  });

  it('rejects negative crossover rate', () => {
    const errors = validateGAConfig(makeConfig({ crossoverRate: -0.1 }));
    expect(errors.crossoverRate).toBeDefined();
  });

  it('accepts crossover rate of 0', () => {
    const errors = validateGAConfig(makeConfig({ crossoverRate: 0 }));
    expect(errors.crossoverRate).toBeUndefined();
  });

  it('accepts crossover rate of 1', () => {
    const errors = validateGAConfig(makeConfig({ crossoverRate: 1 }));
    expect(errors.crossoverRate).toBeUndefined();
  });

  // Mutation rate
  it('rejects mutation rate above 1', () => {
    const errors = validateGAConfig(makeConfig({ mutationRate: 1.5 }));
    expect(errors.mutationRate).toBeDefined();
  });

  it('rejects negative mutation rate', () => {
    const errors = validateGAConfig(makeConfig({ mutationRate: -0.01 }));
    expect(errors.mutationRate).toBeDefined();
  });

  it('accepts mutation rate of 0', () => {
    const errors = validateGAConfig(makeConfig({ mutationRate: 0 }));
    expect(errors.mutationRate).toBeUndefined();
  });

  it('accepts mutation rate of 1', () => {
    const errors = validateGAConfig(makeConfig({ mutationRate: 1 }));
    expect(errors.mutationRate).toBeUndefined();
  });

  // Convergence threshold
  it('rejects negative convergence threshold', () => {
    const errors = validateGAConfig(makeConfig({ convergenceThreshold: -0.001 }));
    expect(errors.convergenceThreshold).toBeDefined();
  });

  it('accepts convergence threshold of 0', () => {
    const errors = validateGAConfig(makeConfig({ convergenceThreshold: 0 }));
    expect(errors.convergenceThreshold).toBeUndefined();
  });

  // Convergence patience
  it('rejects convergence patience of 0', () => {
    const errors = validateGAConfig(makeConfig({ convergencePatience: 0 }));
    expect(errors.convergencePatience).toBeDefined();
  });

  it('rejects negative convergence patience', () => {
    const errors = validateGAConfig(makeConfig({ convergencePatience: -3 }));
    expect(errors.convergencePatience).toBeDefined();
  });

  // Fitness weights
  it('rejects negative rating weight', () => {
    const config = makeConfig();
    config.fitnessWeights.rating = -0.1;
    const errors = validateGAConfig(config);
    expect(errors['fitnessWeights.rating']).toBeDefined();
  });

  it('rejects negative view weight', () => {
    const config = makeConfig();
    config.fitnessWeights.view = -1;
    const errors = validateGAConfig(config);
    expect(errors['fitnessWeights.view']).toBeDefined();
  });

  it('rejects negative click weight', () => {
    const config = makeConfig();
    config.fitnessWeights.click = -0.5;
    const errors = validateGAConfig(config);
    expect(errors['fitnessWeights.click']).toBeDefined();
  });

  it('rejects negative purchase weight', () => {
    const config = makeConfig();
    config.fitnessWeights.purchase = -2;
    const errors = validateGAConfig(config);
    expect(errors['fitnessWeights.purchase']).toBeDefined();
  });

  it('rejects all-zero fitness weights', () => {
    const config = makeConfig();
    config.fitnessWeights = { rating: 0, view: 0, click: 0, purchase: 0 };
    const errors = validateGAConfig(config);
    expect(errors['fitnessWeights']).toBeDefined();
  });

  it('accepts fitness weights that sum to positive', () => {
    const config = makeConfig();
    config.fitnessWeights = { rating: 0, view: 0, click: 0, purchase: 1 };
    const errors = validateGAConfig(config);
    expect(errors['fitnessWeights']).toBeUndefined();
  });

  // Multiple errors
  it('returns multiple errors for multiple invalid fields', () => {
    const config = makeConfig({
      populationSize: -1,
      crossoverRate: 2,
      maxGenerations: 0,
    });
    const errors = validateGAConfig(config);
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(3);
    expect(errors.populationSize).toBeDefined();
    expect(errors.crossoverRate).toBeDefined();
    expect(errors.maxGenerations).toBeDefined();
  });
});
