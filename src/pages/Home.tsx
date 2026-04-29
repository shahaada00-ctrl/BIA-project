const styles = {
  container: {
    maxWidth: '860px',
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
  text: {
    fontSize: '14px',
    color: '#444',
    lineHeight: 1.7,
    margin: '0 0 10px',
  } as React.CSSProperties,
  stepGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '12px',
    marginTop: '12px',
  } as React.CSSProperties,
  stepCard: {
    background: '#f8f8fc',
    borderRadius: '6px',
    padding: '14px',
    borderLeft: '3px solid #6c63ff',
  } as React.CSSProperties,
  stepLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#6c63ff',
    margin: '0 0 4px',
  } as React.CSSProperties,
  stepDesc: {
    fontSize: '13px',
    color: '#555',
    margin: 0,
    lineHeight: 1.5,
  } as React.CSSProperties,
  dataList: {
    listStyle: 'none',
    padding: 0,
    margin: '8px 0 0',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '8px',
  } as React.CSSProperties,
  dataItem: {
    background: '#f0f0f8',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#333',
  } as React.CSSProperties,
  navGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '12px',
    marginTop: '12px',
  } as React.CSSProperties,
  navCard: {
    background: '#f8f8fc',
    borderRadius: '6px',
    padding: '14px',
    textDecoration: 'none',
    color: '#333',
    border: '1px solid #e8e8f0',
    transition: 'box-shadow 0.15s',
  } as React.CSSProperties,
  navCardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1a1a2e',
    margin: '0 0 4px',
  } as React.CSSProperties,
  navCardDesc: {
    fontSize: '12px',
    color: '#666',
    margin: 0,
    lineHeight: 1.5,
  } as React.CSSProperties,
};

const gaSteps = [
  { label: '1. Population', desc: 'Generate an initial set of random product recommendation lists for a user.' },
  { label: '2. Fitness', desc: 'Score each list based on user ratings, views, clicks, and purchases.' },
  { label: '3. Selection', desc: 'Pick the best-performing lists using tournament selection.' },
  { label: '4. Crossover', desc: 'Combine pairs of top lists to create new offspring recommendations.' },
  { label: '5. Mutation', desc: 'Randomly swap products to maintain diversity and explore new options.' },
  { label: '6. Generations', desc: 'Repeat the cycle until recommendations converge or max generations reached.' },
];

const dataSources = [
  { icon: '👤', label: 'Users — demographics (age, location)' },
  { icon: '📦', label: 'Products — catalog (category, price)' },
  { icon: '⭐', label: 'Ratings — user-product ratings (1–5)' },
  { icon: '🖱️', label: 'Behavior — views, clicks, purchases' },
];

const appSections = [
  { title: 'Scientific Article', desc: 'Read the research foundation behind this approach.' },
  { title: 'Data Explorer', desc: 'Browse and visualize the loaded datasets.' },
  { title: 'Algorithm Configuration', desc: 'Tune GA parameters like population size and mutation rate.' },
  { title: 'Run Algorithm', desc: 'Select a user and watch the GA optimize in real time.' },
  { title: 'Results Dashboard', desc: 'Analyze fitness evolution, comparisons, and final recommendations.' },
];

export default function Home() {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>🧬 Genetic Algorithm Product Recommendations</h1>
        <p style={styles.heroSubtitle}>
          This project uses genetic algorithms — inspired by natural selection — to evolve
          and optimize product recommendation lists for individual users, driven by real
          interaction data from an online store.
        </p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How Genetic Algorithms Work</h2>
        <p style={styles.text}>
          A genetic algorithm is an optimization technique that mimics biological evolution.
          It maintains a population of candidate solutions (recommendation lists) and
          iteratively improves them through selection, crossover, and mutation — just like
          natural selection favors the fittest organisms.
        </p>
        <div style={styles.stepGrid}>
          {gaSteps.map((step) => (
            <div key={step.label} style={styles.stepCard}>
              <p style={styles.stepLabel}>{step.label}</p>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Data Sources</h2>
        <p style={styles.text}>
          The algorithm operates on four real-world Excel datasets loaded directly in the browser:
        </p>
        <ul style={styles.dataList}>
          {dataSources.map((ds) => (
            <li key={ds.label} style={styles.dataItem}>
              {ds.icon} {ds.label}
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Explore the App</h2>
        <p style={styles.text}>
          Use the sidebar navigation to explore each section of the application:
        </p>
        <div style={styles.navGrid}>
          {appSections.map((s) => (
            <div key={s.title} style={styles.navCard}>
              <p style={styles.navCardTitle}>{s.title}</p>
              <p style={styles.navCardDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
