import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
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
          padding: '0.5rem 0'
        }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Workspace Control
            </p>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              Trình quản lý Dự án
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="glass-card" style={{ 
              padding: '0.6rem 1.25rem', 
              fontSize: '0.8rem', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              borderRadius: '20px',
              border: '0.5px solid var(--glass-border)'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
              <span style={{ opacity: 0.9 }}>Online</span>
            </div>
          </div>
        </header>

        <section className="animate-fade-in" style={{ flex: 1 }}>
          <Outlet />
        </section>
        

      </main>
    </div>
  );
};

export default Layout;
