import type { GAConfig } from './types';

/**
 * Validates a GAConfig object and returns field-level error messages.
 * An empty object means the config is valid.
 */
export function validateGAConfig(config: GAConfig): Record<string, string> {
  const errors: Record<string, string> = {};

  if (config.populationSize <= 0) {
    errors.populationSize = 'Population size must be greater than 0';
  }

  if (config.productsPerSet <= 0) {
    errors.productsPerSet = 'Products per set must be greater than 0';
  }

  if (config.maxGenerations <= 0) {
    errors.maxGenerations = 'Max generations must be greater than 0';
  }

  if (config.crossoverRate < 0 || config.crossoverRate > 1) {
    errors.crossoverRate = 'Crossover rate must be between 0 and 1';
  }

  if (config.mutationRate < 0 || config.mutationRate > 1) {
    errors.mutationRate = 'Mutation rate must be between 0 and 1';
  }

  if (config.convergenceThreshold < 0) {
    errors.convergenceThreshold = 'Convergence threshold must be >= 0';
  }

  if (config.convergencePatience <= 0) {
    errors.convergencePatience = 'Convergence patience must be greater than 0';
  }

  // Validate fitness weights
  const { rating, view, click, purchase } = config.fitnessWeights;

  if (rating < 0) {
    errors['fitnessWeights.rating'] = 'Rating weight must be >= 0';
  }
  if (view < 0) {
    errors['fitnessWeights.view'] = 'View weight must be >= 0';
  }
  if (click < 0) {
    errors['fitnessWeights.click'] = 'Click weight must be >= 0';
  }
  if (purchase < 0) {
    errors['fitnessWeights.purchase'] = 'Purchase weight must be >= 0';
  }

  const weightSum = rating + view + click + purchase;
  if (weightSum <= 0) {
    errors['fitnessWeights'] = 'Fitness weights must sum to a value greater than 0';
  }

  return errors;
}
