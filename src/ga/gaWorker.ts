import { WorkerInMessage, WorkerOutMessage, GenerationStats } from '../types';
import { runGA } from './gaEngine';

/**
 * Web Worker entry point for the genetic algorithm.
 * Listens for 'start' messages and posts progress/completion/error messages.
 */
self.onmessage = (event: MessageEvent<WorkerInMessage>) => {
  const message = event.data;

  if (message.type === 'start') {
    try {
      const { config, userId, products, ratings, behavior } = message.payload;

      const onGeneration = (stats: GenerationStats) => {
        const outMessage: WorkerOutMessage = {
          type: 'generation-complete',
          payload: stats,
        };
        self.postMessage(outMessage);
      };

      const result = runGA(config, userId, products, ratings, behavior, onGeneration);

      const completeMessage: WorkerOutMessage = {
        type: 'complete',
        payload: result,
      };
      self.postMessage(completeMessage);
    } catch (err) {
      const errorMessage: WorkerOutMessage = {
        type: 'error',
        payload: {
          message: err instanceof Error ? err.message : String(err),
        },
      };
      self.postMessage(errorMessage);
    }
  }
};
