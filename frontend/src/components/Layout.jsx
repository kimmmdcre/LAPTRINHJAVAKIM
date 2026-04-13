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
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header style={{ 
          marginBottom: '2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '0.5rem 0'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Hệ thống Quản lý Dự án</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span className="glass-card" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Phiên bản 1.0.0
            </span>
          </div>
        </header>
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
