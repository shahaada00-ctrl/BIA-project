import React from 'react';

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
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
    marginTop: '12px',
  } as React.CSSProperties,
  metaItem: {
    background: '#f0f0f8',
    borderRadius: '6px',
    padding: '12px 14px',
  } as React.CSSProperties,
  metaLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6c63ff',
    textTransform: 'uppercase' as const,
    margin: '0 0 4px',
    letterSpacing: '0.5px',
  } as React.CSSProperties,
  metaValue: {
    fontSize: '14px',
    color: '#333',
    margin: 0,
    lineHeight: 1.4,
  } as React.CSSProperties,
  findingCard: {
    background: '#f8f8fc',
    borderRadius: '6px',
    padding: '14px',
    borderLeft: '3px solid #6c63ff',
    marginBottom: '10px',
  } as React.CSSProperties,
  findingLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#6c63ff',
    margin: '0 0 4px',
  } as React.CSSProperties,
  findingDesc: {
    fontSize: '13px',
    color: '#555',
    margin: 0,
    lineHeight: 1.5,
  } as React.CSSProperties,
  applicationItem: {
    background: '#f8f8fc',
    borderRadius: '6px',
    padding: '14px',
    borderLeft: '3px solid #28a745',
    marginBottom: '10px',
  } as React.CSSProperties,
  applicationLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#28a745',
    margin: '0 0 4px',
  } as React.CSSProperties,
  applicationDesc: {
    fontSize: '13px',
    color: '#555',
    margin: 0,
    lineHeight: 1.5,
  } as React.CSSProperties,
};

const article = {
  title: 'Customer Behavioural Content Recommendation System Using Decision Tree and Genetic Algorithm for Online Shopping Websites',
  authors: ['A. Shinde', 'S. Shinde', 'H. Vanam', 'R. Somkunwar'],
  year: 2024,
  journal: 'Multidisciplinary Science Journal',
  volume: 'Vol. 7, Issue 1, e2025003',
  doi: '10.31893/multam.2025003',
  url: 'https://www.malque.pub/ojs/index.php/msj/article/view/3865',
};

const keyFindings = [
  {
    label: 'Hybrid GA + Decision Tree Approach',
    desc: 'Combining genetic algorithms with decision tree classifiers for user behavior profiling produces more accurate product recommendations than either technique alone, by leveraging GA\'s optimization strength with decision tree\'s classification capability.',
  },
  {
    label: 'User Behavior-Driven Fitness',
    desc: 'Using multiple behavioral signals (browsing patterns, click history, purchase history) as inputs to the fitness function yields significantly better recommendation quality than relying on explicit ratings alone.',
  },
  {
    label: 'Evolutionary Selection of Features',
    desc: 'Genetic algorithms effectively select the most relevant user behavioral features for recommendation, reducing dimensionality while improving prediction accuracy through natural selection-inspired optimization.',
  },
  {
    label: 'Population-Based Exploration',
    desc: 'Maintaining a diverse population of candidate recommendation strategies through crossover and mutation operators helps avoid local optima and discovers non-obvious product associations that traditional methods miss.',
  },
  {
    label: 'Scalability for E-Commerce',
    desc: 'The GA-based approach scales well to large product catalogs and user bases typical of online shopping platforms, with convergence achieved within a manageable number of generations.',
  },
];

const applications = [
  {
    label: 'Multi-Signal Fitness Evaluation',
    desc: 'Following the paper\'s finding that multiple behavioral signals outperform single-signal approaches, our system combines rating (0.3), view (0.1), click (0.3), and purchase (0.3) weights into a weighted fitness function to score each recommendation set.',
  },
  {
    label: 'Tournament Selection for Diversity',
    desc: 'Inspired by the paper\'s emphasis on population diversity, we use tournament selection with a configurable tournament size (default 3) to balance selection pressure with exploration, preventing premature convergence.',
  },
  {
    label: 'Crossover with Duplicate Repair',
    desc: 'Our single-point crossover operator includes a repair mechanism: when crossover produces duplicate products in an offspring, they are replaced with random catalog items not already in the set, maintaining valid recommendation sets as the paper recommends.',
  },
  {
    label: 'Convergence-Aware Termination',
    desc: 'Building on the paper\'s scalability findings, our GA monitors best fitness stagnation over a configurable patience window (default 10 generations) with a threshold of 0.001, stopping early when no meaningful improvement is detected.',
  },
  {
    label: 'Client-Side Evolutionary Optimization',
    desc: 'The paper\'s demonstration that GA-based recommendation scales to e-commerce datasets informed our decision to run the entire evolutionary process client-side in a Web Worker, making the system a self-contained demo without backend dependencies.',
  },
];

export default function Article() {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>📄 Scientific Article Reference</h1>
        <p style={styles.heroSubtitle}>
          This system is grounded in recent research on evolutionary algorithms for
          recommendation systems. Below is the referenced article and how its ideas
          are applied in our genetic algorithm approach.
        </p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Article Details</h2>
        <p style={{ ...styles.text, fontSize: '15px', fontWeight: 600, color: '#1a1a2e' }}>
          {article.title}
        </p>
        <div style={styles.metaGrid}>
          <div style={styles.metaItem}>
            <p style={styles.metaLabel}>Authors</p>
            <p style={styles.metaValue}>{article.authors.join(', ')}</p>
          </div>
          <div style={styles.metaItem}>
            <p style={styles.metaLabel}>Year</p>
            <p style={styles.metaValue}>{article.year}</p>
          </div>
          <div style={styles.metaItem}>
            <p style={styles.metaLabel}>Journal</p>
            <p style={styles.metaValue}>{article.journal}</p>
          </div>
          <div style={styles.metaItem}>
            <p style={styles.metaLabel}>Volume / Pages</p>
            <p style={styles.metaValue}>{article.volume}</p>
          </div>
          <div style={styles.metaItem}>
            <p style={styles.metaLabel}>DOI / Link</p>
            <p style={styles.metaValue}>
              <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: '#6c63ff', textDecoration: 'underline' }}>
                {article.doi}
              </a>
            </p>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Key Findings</h2>
        <p style={styles.text}>
          The article investigates how genetic algorithms can optimize recommendation lists
          by evolving candidate product sets through selection, crossover, and mutation
          operators guided by real user interaction data. The main findings include:
        </p>
        {keyFindings.map((f) => (
          <div key={f.label} style={styles.findingCard}>
            <p style={styles.findingLabel}>{f.label}</p>
            <p style={styles.findingDesc}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Application in This System</h2>
        <p style={styles.text}>
          The following aspects of our genetic algorithm recommendation system are directly
          inspired by or adapted from the techniques described in the article:
        </p>
        {applications.map((a) => (
          <div key={a.label} style={styles.applicationItem}>
            <p style={styles.applicationLabel}>{a.label}</p>
            <p style={styles.applicationDesc}>{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
