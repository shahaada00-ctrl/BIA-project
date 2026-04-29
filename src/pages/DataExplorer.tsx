import React, { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import type { User, Product, Rating, BehaviorRecord } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// ============================================================
// Styles (consistent with Home / Article pages)
// ============================================================

const styles = {
  container: {
    maxWidth: '1060px',
    margin: '0 auto',
  } as React.CSSProperties,
  hero: {
    textAlign: 'center' as const,
    marginBottom: '40px',
  } as React.CSSProperties,
  heroTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1a1a2e',
    margin: '0 0 12px',
  } as React.CSSProperties,
  heroSubtitle: {
    fontSize: '16px',
    color: '#555',
    lineHeight: 1.6,
    maxWidth: '640px',
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
    margin: '0 0 12px',
  } as React.CSSProperties,
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  } as React.CSSProperties,
  statCard: {
    background: '#f8f8fc',
    borderRadius: '6px',
    padding: '16px',
    borderLeft: '3px solid #6c63ff',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a1a2e',
    margin: '0 0 4px',
  } as React.CSSProperties,
  statLabel: {
    fontSize: '13px',
    color: '#666',
    margin: 0,
  } as React.CSSProperties,
  tabRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  tab: {
    padding: '8px 18px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    background: '#f5f5f5',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    color: '#555',
    transition: 'all 0.15s',
  } as React.CSSProperties,
  tabActive: {
    background: '#6c63ff',
    color: '#fff',
    borderColor: '#6c63ff',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  } as React.CSSProperties,
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    background: '#f0f0f8',
    color: '#1a1a2e',
    fontWeight: 600,
    borderBottom: '2px solid #ddd',
  } as React.CSSProperties,
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid #eee',
    color: '#444',
  } as React.CSSProperties,
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginTop: '12px',
  } as React.CSSProperties,
  pageBtn: {
    padding: '6px 14px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#333',
  } as React.CSSProperties,
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: 'default',
  } as React.CSSProperties,
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))',
    gap: '20px',
  } as React.CSSProperties,
  chartCard: {
    background: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  } as React.CSSProperties,
  chartTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1a1a2e',
    margin: '0 0 12px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  center: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: '#666',
    fontSize: '16px',
  } as React.CSSProperties,
  errorBox: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: '#c0392b',
    fontSize: '15px',
  } as React.CSSProperties,
  retryBtn: {
    marginTop: '12px',
    padding: '8px 20px',
    borderRadius: '6px',
    border: 'none',
    background: '#6c63ff',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  } as React.CSSProperties,
};

// ============================================================
// Constants
// ============================================================

const PAGE_SIZE = 50;

type DatasetKey = 'users' | 'products' | 'ratings' | 'behavior';

const datasetTabs: { key: DatasetKey; label: string }[] = [
  { key: 'users', label: 'Users' },
  { key: 'products', label: 'Products' },
  { key: 'ratings', label: 'Ratings' },
  { key: 'behavior', label: 'Behavior' },
];

// ============================================================
// Chart helpers
// ============================================================

function buildAgeDistribution(users: User[]) {
  const buckets: Record<string, number> = {};
  for (const u of users) {
    const lo = Math.floor(u.age / 10) * 10;
    const label = `${lo}–${lo + 9}`;
    buckets[label] = (buckets[label] ?? 0) + 1;
  }
  const sorted = Object.entries(buckets).sort(
    (a, b) => parseInt(a[0]) - parseInt(b[0]),
  );
  return {
    labels: sorted.map(([l]) => l),
    datasets: [
      {
        label: 'Users',
        data: sorted.map(([, v]) => v),
        backgroundColor: '#6c63ff',
      },
    ],
  };
}

function buildCategoryDistribution(products: Product[]) {
  const counts: Record<string, number> = {};
  for (const p of products) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const colors = [
    '#6c63ff', '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0',
    '#9966ff', '#ff9f40', '#c9cbcf', '#28a745', '#e83e8c',
  ];
  return {
    labels: entries.map(([l]) => l),
    datasets: [
      {
        label: 'Products',
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map((_, i) => colors[i % colors.length]),
      },
    ],
  };
}

function buildRatingDistribution(ratings: Rating[]) {
  const counts = [0, 0, 0, 0, 0]; // index 0 → rating 1, etc.
  for (const r of ratings) {
    const idx = Math.round(r.rating) - 1;
    if (idx >= 0 && idx < 5) counts[idx]++;
  }
  return {
    labels: ['1', '2', '3', '4', '5'],
    datasets: [
      {
        label: 'Ratings',
        data: counts,
        backgroundColor: '#36a2eb',
      },
    ],
  };
}

function buildBehaviorDistribution(behavior: BehaviorRecord[]) {
  let views = 0, clicks = 0, purchases = 0;
  for (const b of behavior) {
    views += b.viewed;
    clicks += b.clicked;
    purchases += b.purchased;
  }
  return {
    labels: ['Views', 'Clicks', 'Purchases'],
    datasets: [
      {
        label: 'Total',
        data: [views, clicks, purchases],
        backgroundColor: ['#6c63ff', '#ff6384', '#28a745'],
      },
    ],
  };
}

// ============================================================
// Table columns per dataset
// ============================================================

const columnDefs: Record<DatasetKey, { key: string; label: string }[]> = {
  users: [
    { key: 'user_id', label: 'User ID' },
    { key: 'age', label: 'Age' },
    { key: 'location', label: 'Country' },
  ],
  products: [
    { key: 'product_id', label: 'Product ID' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price' },
  ],
  ratings: [
    { key: 'user_id', label: 'User ID' },
    { key: 'product_id', label: 'Product ID' },
    { key: 'rating', label: 'Rating' },
  ],
  behavior: [
    { key: 'user_id', label: 'User ID' },
    { key: 'product_id', label: 'Product ID' },
    { key: 'viewed', label: 'Viewed' },
    { key: 'clicked', label: 'Clicked' },
    { key: 'purchased', label: 'Purchased' },
  ],
};

// ============================================================
// Component
// ============================================================

export default function DataExplorer() {
  const { state, loadData } = useAppContext();
  const { users, products, ratings, behavior, loading, error } = state;

  const [activeTab, setActiveTab] = useState<DatasetKey>('users');
  const [page, setPage] = useState(0);
  // Load data on mount if not already loaded
  useEffect(() => {
    if (users.length === 0 && !loading && !error) {
      loadData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset page when switching tabs
  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  // Current dataset rows
  const datasetMap: Record<DatasetKey, Record<string, unknown>[]> = useMemo(
    () => ({
      users: users as unknown as Record<string, unknown>[],
      products: products as unknown as Record<string, unknown>[],
      ratings: ratings as unknown as Record<string, unknown>[],
      behavior: behavior as unknown as Record<string, unknown>[],
    }),
    [users, products, ratings, behavior],
  );

  const rows = datasetMap[activeTab];
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const cols = columnDefs[activeTab];

  // Chart data (memoised)
  const ageChart = useMemo(() => buildAgeDistribution(users), [users]);
  const categoryChart = useMemo(() => buildCategoryDistribution(products), [products]);
  const ratingChart = useMemo(() => buildRatingDistribution(ratings), [ratings]);
  const behaviorChart = useMemo(() => buildBehaviorDistribution(behavior), [behavior]);

  // ---- Loading / Error states ----
  if (loading) {
    return (
      <div style={styles.center}>
        <p>⏳ Loading datasets…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorBox}>
        <p>❌ {error}</p>
        <button style={styles.retryBtn} onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  // ---- Main render ----
  return (
    <div style={styles.container}>
      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>📊 Data Explorer</h1>
        <p style={styles.heroSubtitle}>
          Browse the loaded datasets, view summary statistics, and explore data
          distributions through interactive charts.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Summary Statistics</h2>
        <div style={styles.statGrid}>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{users.length.toLocaleString()}</p>
            <p style={styles.statLabel}>Total Users</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{products.length.toLocaleString()}</p>
            <p style={styles.statLabel}>Total Products</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{ratings.length.toLocaleString()}</p>
            <p style={styles.statLabel}>Total Ratings</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{behavior.length.toLocaleString()}</p>
            <p style={styles.statLabel}>Behavior Records</p>
          </div>
        </div>
      </div>

      {/* Dataset Table */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Dataset Browser</h2>

        {/* Tabs */}
        <div style={styles.tabRow}>
          {datasetTabs.map((t) => (
            <button
              key={t.key}
              style={{
                ...styles.tab,
                ...(activeTab === t.key ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label} ({datasetMap[t.key].length.toLocaleString()})
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c.key} style={styles.th}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={i}>
                  {cols.map((c) => (
                    <td key={c.key} style={styles.td}>
                      {String(row[c.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={cols.length}
                    style={{ ...styles.td, textAlign: 'center', color: '#999' }}
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={styles.pagination}>
          <button
            style={{
              ...styles.pageBtn,
              ...(page === 0 ? styles.pageBtnDisabled : {}),
            }}
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '13px', color: '#555' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            style={{
              ...styles.pageBtn,
              ...(page >= totalPages - 1 ? styles.pageBtnDisabled : {}),
            }}
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Distribution Charts */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Data Distributions</h2>
        <div style={styles.chartGrid}>
          <div style={styles.chartCard}>
            <p style={styles.chartTitle}>User Age Distribution</p>
            <Bar
              data={ageChart}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: { title: { display: true, text: 'Age Range' } },
                  y: { title: { display: true, text: 'Count' }, beginAtZero: true },
                },
              }}
            />
          </div>

          <div style={styles.chartCard}>
            <p style={styles.chartTitle}>Product Category Distribution</p>
            <Pie
              data={categoryChart}
              options={{
                responsive: true,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>

          <div style={styles.chartCard}>
            <p style={styles.chartTitle}>Rating Distribution (1–5)</p>
            <Bar
              data={ratingChart}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: { title: { display: true, text: 'Rating' } },
                  y: { title: { display: true, text: 'Count' }, beginAtZero: true },
                },
              }}
            />
          </div>

          <div style={styles.chartCard}>
            <p style={styles.chartTitle}>Behavior Action Distribution</p>
            <Bar
              data={behaviorChart}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: { title: { display: true, text: 'Action' } },
                  y: { title: { display: true, text: 'Total' }, beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
