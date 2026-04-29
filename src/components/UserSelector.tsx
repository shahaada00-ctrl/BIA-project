import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';

// ============================================================
// Styles (consistent with AlgorithmConfig / DataExplorer)
// ============================================================

const styles = {
  container: {
    position: 'relative' as const,
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
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: '4px',
    display: 'block',
  } as React.CSSProperties,
  inputWrapper: {
    position: 'relative' as const,
  } as React.CSSProperties,
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    color: '#333',
    outline: 'none',
    width: '240px',
    transition: 'border-color 0.15s',
  } as React.CSSProperties,
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    width: '264px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '0 0 6px 6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 10,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  } as React.CSSProperties,
  dropdownItem: {
    padding: '8px 12px',
    fontSize: '14px',
    color: '#333',
    cursor: 'pointer',
    transition: 'background 0.1s',
  } as React.CSSProperties,
  dropdownItemHover: {
    background: '#f0f0ff',
  } as React.CSSProperties,
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  } as React.CSSProperties,
  profileCard: {
    background: '#f8f8fc',
    borderRadius: '6px',
    padding: '12px 16px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  profileLabel: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0 0 4px',
  } as React.CSSProperties,
  profileValue: {
    fontSize: '18px',
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
  noData: {
    fontSize: '14px',
    color: '#888',
    fontStyle: 'italic' as const,
  } as React.CSSProperties,
};

// ============================================================
// Component
// ============================================================

export default function UserSelector() {
  const { state, selectUser } = useAppContext();
  const { userProfiles, selectedUser } = state;

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filtered user IDs based on query
  const filteredIds = useMemo(() => {
    const ids = userProfiles.map((p) => p.user.user_id);
    if (!query.trim()) return ids.slice(0, 50); // show first 50 when empty
    return ids.filter((id) => String(id).includes(query.trim())).slice(0, 50);
  }, [userProfiles, query]);

  const handleSelect = (userId: number) => {
    selectUser(userId);
    setQuery(String(userId));
    setOpen(false);
  };

  return (
    <div style={styles.container}>
      {/* Search input */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>👤 Select User</h2>
        <label style={styles.label}>User ID</label>
        <div ref={wrapperRef} style={styles.inputWrapper}>
          <input
            type="text"
            style={styles.input}
            placeholder="Type a user ID to search…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
          {open && filteredIds.length > 0 && (
            <ul style={styles.dropdown} role="listbox">
              {filteredIds.map((id, idx) => (
                <li
                  key={id}
                  role="option"
                  aria-selected={selectedUser?.user.user_id === id}
                  style={{
                    ...styles.dropdownItem,
                    ...(hoveredIdx === idx ? styles.dropdownItemHover : {}),
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(-1)}
                  onClick={() => handleSelect(id)}
                >
                  User {id}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Selected user profile */}
      {selectedUser && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>User Profile — #{selectedUser.user.user_id}</h2>

          <div style={styles.profileGrid}>
            <div style={styles.profileCard}>
              <p style={styles.profileLabel}>Age</p>
              <p style={styles.profileValue}>{selectedUser.user.age}</p>
            </div>
            <div style={styles.profileCard}>
              <p style={styles.profileLabel}>Location</p>
              <p style={styles.profileValue}>{selectedUser.user.location}</p>
            </div>
            <div style={styles.profileCard}>
              <p style={styles.profileLabel}>Ratings</p>
              <p style={styles.profileValue}>{selectedUser.ratingCount}</p>
            </div>
            <div style={styles.profileCard}>
              <p style={styles.profileLabel}>Behavior Records</p>
              <p style={styles.profileValue}>{selectedUser.behaviorCount}</p>
            </div>
          </div>

          {/* Top 5 highest-rated products */}
          <h3 style={{ ...styles.sectionTitle, fontSize: '15px', marginTop: '8px' }}>
            Top 5 Highest-Rated Products
          </h3>
          {selectedUser.topRatedProducts.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Product ID</th>
                  <th style={styles.th}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {selectedUser.topRatedProducts.slice(0, 5).map((p, i) => (
                  <tr key={p.product_id}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>{p.product_id}</td>
                    <td style={styles.td}>⭐ {p.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={styles.noData}>No ratings found for this user.</p>
          )}
        </div>
      )}
    </div>
  );
}
