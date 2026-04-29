import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAppContext } from '../store/AppContext';
import UserSelector from '../components/UserSelector';
import type { WorkerOutMessage } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// ============================================================
// Styles
// ============================================================

const styles = {
  container: {
    maxWidth: '960px',
    margin: '0 auto',
  } as React.CSSProperties,
  section: {
    background: '#fff',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1a1a2e',
    margin: '0 0 16px',
  } as React.CSSProperties,
  runButton: {
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    background: '#4361ee',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  } as React.CSSProperties,
  runButtonDisabled: {
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    background: '#aaa',
    border: 'none',
    borderRadius: '8px',
    cursor: 'not-allowed',
  } as React.CSSProperties,
  progressGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  } as React.CSSProperties,
  progressCard: {
    background: '#f8f8fc',
    borderRadius: '6px',
    padding: '12px 16px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  progressLabel: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0 0 4px',
  } as React.CSSProperties,
  progressValue: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1a1a2e',
    margin: 0,
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  } as React.CSSProperties,
  th: {
    textAlign: 'left' as const,
    padding: '8px 12px',
    borderBottom: '2px solid #eee',
    color: '#1a1a2e',
    fontWeight: 600,
    fontSize: '13px',
  } as React.CSSProperties,
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid #f0f0f0',
    color: '#444',
  } as React.CSSProperties,
  errorBox: {
    background: '#fff0f0',
    border: '1px solid #ffcccc',
    borderRadius: '8px',
    padding: '16px 20px',
    marginBottom: '20px',
    color: '#cc0000',
    fontSize: '14px',
  } as React.CSSProperties,
  retryButton: {
    marginTop: '10px',
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    background: '#e74c3c',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  } as React.CSSProperties,
  chartWrapper: {
    height: '320px',
    position: 'relative' as const,
  } as React.CSSProperties,
};

// ============================================================
// Component
// ============================================================

export default function RunAlgorithm() {
  const { state, loadData, startGA, updateProgress, setResults } = useAppContext();
  const {
    users,
    products,
    ratings,
    behavior,
    gaConfig,
    selectedUser,
    running,
    generationHistory,
    result,
    loading,
  } = state;

  const workerRef = useRef<Worker | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount if not loaded
  useEffect(() => {
    if (users.length === 0 && !loading) {
      loadData();
    }
  }, [users.length, loading, loadData]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleRun = () => {
    if (!selectedUser) return;

    setError(null);
    startGA();

    const worker = new Worker(
      new URL('../ga/gaWorker.ts', import.meta.url),
      { type: 'module' },
    );
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
      const msg = event.data;
      if (msg.type === 'generation-complete') {
        updateProgress(msg.payload);
      } else if (msg.type === 'complete') {
        setResults(msg.payload);
        worker.terminate();
        workerRef.current = null;
      } else if (msg.type === 'error') {
        setError(msg.payload.message);
        setResults({
          finalBestSet: { productIds: [], fitnessScore: 0 },
          generationHistory: [],
          totalGenerations: 0,
          converged: false,
          fitnessImprovement: 0,
        });
        worker.terminate();
        workerRef.current = null;
      }
    };

    worker.onerror = (e) => {
      setError(e.message || 'Web Worker encountered an unexpected error.');
      setResults({
        finalBestSet: { productIds: [], fitnessScore: 0 },
        generationHistory: [],
        totalGenerations: 0,
        converged: false,
        fitnessImprovement: 0,
      });
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage({
      type: 'start',
      payload: {
        config: gaConfig,
        userId: selectedUser.user.user_id,
        products,
        ratings,
        behavior,
      },
    });
  };

  const handleRetry = () => {
    handleRun();
  };

  // Build chart data from generationHistory
  const chartData = {
    labels: generationHistory.map((g) => String(g.generation)),
    datasets: [
      {
        label: 'Best Fitness',
        data: generationHistory.map((g) => g.bestFitness),
        borderColor: '#4361ee',
        backgroundColor: 'rgba(67, 97, 238, 0.1)',
        tension: 0.3,
        pointRadius: 2,
      },
      {
        label: 'Average Fitness',
        data: generationHistory.map((g) => g.avgFitness),
        borderColor: '#f77f00',
        backgroundColor: 'rgba(247, 127, 0, 0.1)',
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Fitness Evolution' },
    },
    scales: {
      x: { title: { display: true, text: 'Generation' } },
      y: { title: { display: true, text: 'Fitness Score' }, min: 0, max: 1 },
    },
    animation: { duration: 0 } as const,
  };

  // Build result product details
  const resultProducts = result
    ? result.finalBestSet.productIds.map((pid) => {
        const p = products.find((pr) => pr.product_id === pid);
        return p ?? { product_id: pid, category: 'Unknown', price: 0 };
      })
    : [];

  const currentGen = generationHistory.length;
  const bestFitness =
    generationHistory.length > 0
      ? generationHistory[generationHistory.length - 1].bestFitness
      : 0;

  const isDisabled = !selectedUser || running;

  return (
    <div style={styles.container}>
      {/* User Selection */}
      <UserSelector />

      {/* Run Button */}
      <div style={styles.section}>
        <button
          style={isDisabled ? styles.runButtonDisabled : styles.runButton}
          disabled={isDisabled}
          onClick={handleRun}
        >
          {running ? '⏳ Running…' : '🚀 Run Algorithm'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {error}
          <br />
          <button style={styles.retryButton} onClick={handleRetry}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Progress */}
      {(running || generationHistory.length > 0) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📊 Progress</h2>
          <div style={styles.progressGrid}>
            <div style={styles.progressCard}>
              <p style={styles.progressLabel}>Generation</p>
              <p style={styles.progressValue}>
                {currentGen} / {gaConfig.maxGenerations}
              </p>
            </div>
            <div style={styles.progressCard}>
              <p style={styles.progressLabel}>Best Fitness</p>
              <p style={styles.progressValue}>{bestFitness.toFixed(4)}</p>
            </div>
          </div>

          {/* Chart */}
          <div style={styles.chartWrapper}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Results */}
      {result && result.finalBestSet.productIds.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            🏆 Final Recommendation Set (Fitness: {result.finalBestSet.fitnessScore.toFixed(4)})
          </h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Product ID</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
              </tr>
            </thead>
            <tbody>
              {resultProducts.map((p, i) => (
                <tr key={p.product_id}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>{p.product_id}</td>
                  <td style={styles.td}>{p.category}</td>
                  <td style={styles.td}>${p.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
