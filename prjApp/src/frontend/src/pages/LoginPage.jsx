import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, User, ShieldCheck, GitBranch, Briefcase, Eye, EyeOff } from 'lucide-react';
import { useUI } from '../context/UIContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      padding: '1rem'
    }}>
      <div className="glass-card animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '420px', 
        padding: '2.5rem',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '16px', 
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
        }}>
          <ShieldCheck color="white" size={32} />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Chào mừng trở lại</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Đăng nhập vào hệ thống JiraGit Support</p>

        {error && (
          <div className="glass-card" style={{ 
            padding: '0.75rem', 
            marginBottom: '1.5rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            borderColor: 'rgba(239, 68, 68, 0.2)',
            color: 'var(--danger)',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ textAlign: 'left' }}>
            <label className="input-label">Tên đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="input-field" 
                style={{ paddingLeft: '40px' }}
                placeholder="Nhập username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ textAlign: 'left' }}>
            <label className="input-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type={showPassword ? 'text' : 'password'}
                className="input-field" 
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', height: '48px', marginBottom: '1.5rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xác thực...' : (
              <>
                <LogIn size={18} />
                Đăng nhập ngay
              </>
            )}
          </button>
        </form>

        <div style={{ position: 'relative', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--surface-border)' }}></div>
          <span style={{ position: 'relative', background: 'var(--surface)', padding: '0 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hoặc đăng nhập với</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button 
            className="btn btn-outline" 
            style={{ justifyContent: 'center', background: '#24292e', color: 'white', border: 'none' }}
            onClick={() => showToast('Simulated: Đăng nhập GitHub thành công', 'success')}
          >
            <GitBranch size={18} />
            GitHub
          </button>
          <button 
            className="btn btn-outline" 
            style={{ justifyContent: 'center', background: '#0052CC', color: 'white', border: 'none' }}
            onClick={() => showToast('Simulated: Đăng nhập Jira thành công', 'success')}
          >
            <Briefcase size={18} />
            Jira
          </button>
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Quên mật khẩu? Liên hệ <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>Quản trị viên</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
