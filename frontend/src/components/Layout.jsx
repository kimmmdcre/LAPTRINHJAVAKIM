import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const Layout = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-layout" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'auto 1fr', 
      minHeight: '100vh',
      background: 'transparent'
    }}>
      <Sidebar />
      <main className="dashboard-main" style={{ 
        padding: '2rem', 
        overflowY: 'auto',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <header style={{ 
          marginBottom: '2.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '0.5rem 0',
          borderBottom: '1px solid var(--glass-border)'
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.03em' }}>
              Trung tâm Điều hành
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Chào mừng trở lại, {user?.hoTen}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="glass-card" style={{ 
              padding: '0.6rem 1.2rem', 
              fontSize: '0.75rem', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--primary)'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div>
              Hệ thống Sẵn sàng
            </div>
          </div>
        </header>

        <section className="animate-fade-in" style={{ flex: 1 }}>
          <Outlet />
        </section>
        
        <footer style={{ marginTop: '3rem', padding: '1.5rem 0', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)' }}>
           © 2026 JiraGit Support Pro • Phát triển bởi Antigravity Team
        </footer>
      </main>
    </div>
  );
};

export default Layout;
