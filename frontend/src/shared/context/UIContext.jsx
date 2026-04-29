/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [toasts, setToasts] = useState([]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <UIContext.Provider value={{ showToast, darkMode, toggleDarkMode }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className="animate-fade-in"
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: toast.type === 'success' 
                ? 'rgba(34, 197, 94, 0.9)' 
                : toast.type === 'danger' 
                ? 'rgba(239, 68, 68, 0.9)' 
                : 'rgba(59, 130, 246, 0.9)'
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
