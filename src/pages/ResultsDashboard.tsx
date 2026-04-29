import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { useAppContext } from '../store/AppContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend);

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
  prompt: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: '#888',
    fontSize: '16px',
  } as React.CSSProperties,
  promptIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  } as React.CSSProperties,
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  } as React.CSSProperties,
  card: {
    background: '#f8f8fc',
    borderRadius: '6px',
    padding: '12px 16px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  cardLabel: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0 0 4px',
  } as React.CSSProperties,
  cardValue: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1a1a2e',
    margin: 0,
  } as React.CSSProperties,
  improvementPositive: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#2ecc71',
    margin: 0,
  } as React.CSSProperties,
  improvementNegative: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#e74c3c',
    margin: 0,
  } as React.CSSProperties,
  chartWrapper: {
    height: '320px',
    position: 'relative' as const,
  } as React.CSSProperties,
  pieWrapper: {
    height: '300px',
    maxWidth: '400px',
    margin: '0 auto',
    position: 'relative' as const,
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
};

// ============================================================
// Helpers
// ============================================================

const PIE_COLORS = [
  '#4361ee', '#f77f00', '#2ecc71', '#e74c3c', '#9b59b6',
  '#1abc9c', '#f39c12', '#3498db', '#e67e22', '#95a5a6',
];

export function computeCategoryDistribution(
  productIds: number[],
  products: { product_id: number; category: string }[],
): Record<string, number> {
  const productMap = new Map(products.map((p) => [p.product_id, p.category]));
  const dist: Record<string, number> = {};
  for (const pid of productIds) {
    const cat = productMap.get(pid) ?? 'Unknown';
    dist[cat] = (dist[cat] ?? 0) + 1;
  }
  return dist;
}

// ============================================================
// Component
// ============================================================

export default function ResultsDashboard() {
  const { state } = useAppContext();
  const { result, products } = state;

  // No result yet — prompt user
  if (!result) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.section, ...styles.prompt }}>
          <div style={styles.promptIcon}>🧬</div>
          <p>No results available yet.</p>
          <p>Navigate to the <strong>Run Algorithm</strong> page to execute the genetic algorithm first.</p>
        </div>
      </div>
    );
  }

  const { finalBestSet, generationHistory, totalGenerations, converged, fitnessImprovement } = result;

  // ---- Fitness evolution line chart ----
  const lineChartData = {
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

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Fitness Evolution Across Generations' },
    },
    scales: {
      x: { title: { display: true, text: 'Generation' } },
      y: { title: { display: true, text: 'Fitness Score' }, min: 0, max: 1 },
    },
  };

  // ---- Comparison: initial vs final ----
  const initialBestFitness = generationHistory.length > 0 ? generationHistory[0].bestFitness : 0;
  const finalBestFitness = finalBestSet.fitnessScore;

  // ---- Category distribution pie chart ----
  const categoryDist = computeCategoryDistribution(finalBestSet.productIds, products);
  const categories = Object.keys(categoryDist);
  const categoryCounts = Object.values(categoryDist);

  const pieChartData = {
    labels: categories,
    datasets: [
      {
        data: categoryCounts,
        backgroundColor: categories.map((_, i) => PIE_COLORS[i % PIE_COLORS.length]),
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const },
      title: { display: true, text: 'Product Category Distribution' },
    },
  };

  return (
    <div style={styles.container}>
      {/* Fitness Evolution Line Chart */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📈 Fitness Evolution</h2>
        <div style={styles.chartWrapper}>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      {/* Comparison: Initial vs Final */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>⚖️ Initial vs Final Comparison</h2>
        <div style={styles.comparisonGrid}>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Initial Best Fitness</p>
            <p style={styles.cardValue}>{initialBestFitness.toFixed(4)}</p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Final Best Fitness</p>
            <p style={styles.cardValue}>{finalBestFitness.toFixed(4)}</p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Improvement</p>
            <p style={fitnessImprovement >= 0 ? styles.improvementPositive : styles.improvementNegative}>
              {fitnessImprovement >= 0 ? '+' : ''}{fitnessImprovement.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Category Distribution Pie Chart */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🥧 Category Distribution</h2>
        <div style={styles.pieWrapper}>
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </div>

      {/* Summary Table */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📋 Summary</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Metric</th>
              <th style={styles.th}>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>Total Generations</td>
              <td style={styles.td}>{totalGenerations}</td>
            </tr>
            <tr>
              <td style={styles.td}>Final Best Fitness</td>
              <td style={styles.td}>{finalBestFitness.toFixed(4)}</td>
            </tr>
            <tr>
              <td style={styles.td}>Fitness Improvement</td>
              <td style={styles.td}>{fitnessImprovement.toFixed(2)}%</td>
            </tr>
            <tr>
              <td style={styles.td}>Convergence</td>
              <td style={styles.td}>{converged ? '✅ Yes' : '❌ No'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
