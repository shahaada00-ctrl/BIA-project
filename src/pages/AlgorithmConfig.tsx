import React, { useState, useCallback, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { validateGAConfig } from '../validation';
import { DEFAULT_GA_CONFIG, DEFAULT_FITNESS_WEIGHTS } from '../types';
import type { GAConfig, FitnessWeights } from '../types';

// ============================================================
// Styles (consistent with DataExplorer / Home pages)
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
    margin: '0 0 16px',
  } as React.CSSProperties,
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  } as React.CSSProperties,
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  } as React.CSSProperties,
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1a1a2e',
  } as React.CSSProperties,
  labelHint: {
    fontSize: '11px',
    fontWeight: 400,
    color: '#888',
  } as React.CSSProperties,
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    color: '#333',
    outline: 'none',
    transition: 'border-color 0.15s',
  } as React.CSSProperties,
  inputError: {
    borderColor: '#e74c3c',
  } as React.CSSProperties,
  errorText: {
    fontSize: '12px',
    color: '#e74c3c',
    margin: 0,
    minHeight: '16px',
  } as React.CSSProperties,
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '8px',
  } as React.CSSProperties,
  saveBtn: {
    padding: '10px 28px',
    borderRadius: '6px',
    border: 'none',
    background: '#6c63ff',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'opacity 0.15s',
  } as React.CSSProperties,
  saveBtnDisabled: {
    opacity: 0.5,
    cursor: 'default',
  } as React.CSSProperties,
  resetBtn: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    background: '#f5f5f5',
    color: '#555',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  } as React.CSSProperties,
  successMsg: {
    fontSize: '13px',
    color: '#28a745',
    fontWeight: 500,
  } as React.CSSProperties,
  weightsNote: {
    fontSize: '12px',
    color: '#888',
    margin: '0 0 12px',
  } as React.CSSProperties,
};

// ============================================================
// Helper: parse a number input value, returning NaN for empty
// ============================================================

function parseNum(value: string): number {
  if (value.trim() === '') return NaN;
  return Number(value);
}

// ============================================================
// Component
// ============================================================

export default function AlgorithmConfig() {
  const { state, setConfig } = useAppContext();

  // Local draft config for editing
  const [draft, setDraft] = useState<GAConfig>(() => ({
    ...state.gaConfig,
    fitnessWeights: { ...state.gaConfig.fitnessWeights },
  }));

  const [saved, setSaved] = useState(false);

  // Validate on every change
  const errors = useMemo(() => validateGAConfig(draft), [draft]);
  const hasErrors = Object.keys(errors).length > 0;

  // Generic updater for top-level numeric fields
  const updateField = useCallback(
    (field: keyof Omit<GAConfig, 'fitnessWeights'>, value: string) => {
      setSaved(false);
      setDraft((prev) => ({ ...prev, [field]: parseNum(value) }));
    },
    [],
  );

  // Updater for fitness weight fields
  const updateWeight = useCallback(
    (field: keyof FitnessWeights, value: string) => {
      setSaved(false);
      setDraft((prev) => ({
        ...prev,
        fitnessWeights: { ...prev.fitnessWeights, [field]: parseNum(value) },
      }));
    },
    [],
  );

  // Save handler
  const handleSave = useCallback(() => {
    if (hasErrors) return;
    setConfig(draft);
    setSaved(true);
  }, [draft, hasErrors, setConfig]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setSaved(false);
    setDraft({
      ...DEFAULT_GA_CONFIG,
      fitnessWeights: { ...DEFAULT_FITNESS_WEIGHTS },
    });
  }, []);

  // Field renderer helper
  const renderField = (
    label: string,
    hint: string,
    field: string,
    value: number,
    onChange: (v: string) => void,
    step?: string,
  ) => (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>
        {label} <span style={styles.labelHint}>({hint})</span>
      </label>
      <input
        type="number"
        style={{
          ...styles.input,
          ...(errors[field] ? styles.inputError : {}),
        }}
        value={isNaN(value) ? '' : value}
        step={step ?? 'any'}
        onChange={(e) => onChange(e.target.value)}
      />
      <p style={styles.errorText}>{errors[field] ?? ''}</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>⚙️ Algorithm Configuration</h1>
        <p style={styles.heroSubtitle}>
          Adjust the genetic algorithm parameters below. Invalid values will be
          highlighted — fix them before saving.
        </p>
      </div>

      {/* General Parameters */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>General Parameters</h2>
        <div style={styles.fieldGrid}>
          {renderField(
            'Population Size',
            `default ${DEFAULT_GA_CONFIG.populationSize}`,
            'populationSize',
            draft.populationSize,
            (v) => updateField('populationSize', v),
            '1',
          )}
          {renderField(
            'Products per Recommendation',
            `default ${DEFAULT_GA_CONFIG.productsPerSet}`,
            'productsPerSet',
            draft.productsPerSet,
            (v) => updateField('productsPerSet', v),
            '1',
          )}
          {renderField(
            'Max Generations',
            `default ${DEFAULT_GA_CONFIG.maxGenerations}`,
            'maxGenerations',
            draft.maxGenerations,
            (v) => updateField('maxGenerations', v),
            '1',
          )}
          {renderField(
            'Crossover Rate',
            `default ${DEFAULT_GA_CONFIG.crossoverRate}`,
            'crossoverRate',
            draft.crossoverRate,
            (v) => updateField('crossoverRate', v),
            '0.01',
          )}
          {renderField(
            'Mutation Rate',
            `default ${DEFAULT_GA_CONFIG.mutationRate}`,
            'mutationRate',
            draft.mutationRate,
            (v) => updateField('mutationRate', v),
            '0.01',
          )}
        </div>
      </div>

      {/* Convergence Parameters */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Convergence Parameters</h2>
        <div style={styles.fieldGrid}>
          {renderField(
            'Convergence Threshold',
            `default ${DEFAULT_GA_CONFIG.convergenceThreshold}`,
            'convergenceThreshold',
            draft.convergenceThreshold,
            (v) => updateField('convergenceThreshold', v),
            '0.001',
          )}
          {renderField(
            'Convergence Patience',
            `default ${DEFAULT_GA_CONFIG.convergencePatience}`,
            'convergencePatience',
            draft.convergencePatience,
            (v) => updateField('convergencePatience', v),
            '1',
          )}
        </div>
      </div>

      {/* Fitness Weights */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Fitness Weights</h2>
        <p style={styles.weightsNote}>
          Weights control how much each signal contributes to the fitness score.
          All weights must be ≥ 0 and their sum must be &gt; 0.
        </p>
        {errors['fitnessWeights'] && (
          <p style={{ ...styles.errorText, marginBottom: '12px' }}>
            {errors['fitnessWeights']}
          </p>
        )}
        <div style={styles.fieldGrid}>
          {renderField(
            'Rating Weight',
            `default ${DEFAULT_FITNESS_WEIGHTS.rating}`,
            'fitnessWeights.rating',
            draft.fitnessWeights.rating,
            (v) => updateWeight('rating', v),
            '0.05',
          )}
          {renderField(
            'View Weight',
            `default ${DEFAULT_FITNESS_WEIGHTS.view}`,
            'fitnessWeights.view',
            draft.fitnessWeights.view,
            (v) => updateWeight('view', v),
            '0.05',
          )}
          {renderField(
            'Click Weight',
            `default ${DEFAULT_FITNESS_WEIGHTS.click}`,
            'fitnessWeights.click',
            draft.fitnessWeights.click,
            (v) => updateWeight('click', v),
            '0.05',
          )}
          {renderField(
            'Purchase Weight',
            `default ${DEFAULT_FITNESS_WEIGHTS.purchase}`,
            'fitnessWeights.purchase',
            draft.fitnessWeights.purchase,
            (v) => updateWeight('purchase', v),
            '0.05',
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={styles.section}>
        <div style={styles.actions}>
          <button
            style={{
              ...styles.saveBtn,
              ...(hasErrors ? styles.saveBtnDisabled : {}),
            }}
            disabled={hasErrors}
            onClick={handleSave}
          >
            Save Configuration
          </button>
          <button style={styles.resetBtn} onClick={handleReset}>
            Reset to Defaults
          </button>
          {saved && (
            <span style={styles.successMsg}>✓ Configuration saved</span>
          )}
        </div>
      </div>
    </div>
  );
}
