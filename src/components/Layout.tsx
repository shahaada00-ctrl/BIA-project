import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/article', label: 'Scientific Article' },
  { to: '/data', label: 'Data Explorer' },
  { to: '/config', label: 'Algorithm Configuration' },
  { to: '/run', label: 'Run Algorithm' },
  { to: '/results', label: 'Results Dashboard' },
];

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  } as React.CSSProperties,
  sidebar: {
    width: '260px',
    background: '#1a1a2e',
    color: '#e0e0e0',
    display: 'flex',
    flexDirection: 'column' as const,
    flexShrink: 0,
  } as React.CSSProperties,
  logo: {
    padding: '20px 16px',
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
    borderBottom: '1px solid #2a2a4a',
  } as React.CSSProperties,
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '8px 0',
    gap: '2px',
  } as React.CSSProperties,
  link: {
    display: 'block',
    padding: '10px 20px',
    color: '#b0b0c0',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'background 0.15s, color 0.15s',
    borderLeft: '3px solid transparent',
  } as React.CSSProperties,
  activeLink: {
    color: '#fff',
    background: '#2a2a4a',
    borderLeftColor: '#6c63ff',
  } as React.CSSProperties,
  content: {
    flex: 1,
    padding: '24px 32px',
    background: '#f5f5f5',
    overflowY: 'auto' as const,
  } as React.CSSProperties,
  hamburger: {
    display: 'none',
    position: 'fixed' as const,
    top: '12px',
    left: '12px',
    zIndex: 1001,
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '20px',
    cursor: 'pointer',
  } as React.CSSProperties,
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 999,
  } as React.CSSProperties,
};

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .layout-sidebar {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .layout-sidebar.open {
            transform: translateX(0);
          }
          .layout-hamburger {
            display: block !important;
          }
          .layout-content {
            padding: 24px 16px !important;
            padding-top: 56px !important;
          }
        }
      `}</style>

      <button
        className="layout-hamburger"
        style={styles.hamburger}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle navigation menu"
      >
        ☰
      </button>

      {menuOpen && (
        <div style={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}

      <div style={styles.container}>
        <aside
          className={`layout-sidebar${menuOpen ? ' open' : ''}`}
          style={styles.sidebar}
        >
          <div style={styles.logo}>🧬 GA Recommendations</div>
          <nav style={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  ...styles.link,
                  ...(isActive ? styles.activeLink : {}),
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="layout-content" style={styles.content}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
