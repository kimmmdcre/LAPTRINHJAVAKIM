import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  Lock, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Cpu, 
  Zap,
  Globe,
  ArrowRight,
  AlertCircle,
  GitBranch as GitIcon
} from 'lucide-react';
import uthLogo from '../assets/logo.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
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
    <div className="animate-fade-in" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--background)'
    }}>
      {/* Background with Apple-style soft gradients */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(0, 122, 255, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(88, 86, 214, 0.1) 0%, transparent 40%)',
        zIndex: 0
      }}></div>
      
      {/* Main Login Card - iOS 18 "Sheet" Style */}
      <div className="glass-card animate-slide-up" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)',
        border: '0.5px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Logo Hub - Clean iOS App Icon Look */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '18px',
          background: '#fff',
          margin: '0 auto 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden'
        }} className="animate-float">
          <img src={uthLogo} alt="UTH Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 2 }}>
            <Zap size={12} fill="currentColor" />
          </div>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
          JiraGit
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem', fontWeight: '500' }}>
          Đăng nhập để bắt đầu phiên làm việc
        </p>

        {error && (
          <div className="animate-slide-up" style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            background: 'rgba(255, 59, 48, 0.15)',
            borderRadius: '12px',
            color: '#FF453A',
            fontSize: '0.85rem',
            fontWeight: '600',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '0.5px solid rgba(255, 59, 48, 0.3)'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="input-group">
            <label className="input-label">Tài khoản hoặc Email</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '48px' }}
                placeholder="Username or Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label className="input-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                style={{ paddingLeft: '48px', paddingRight: '48px' }}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
                width: '100%', 
                height: '52px', 
                fontSize: '1rem', 
                fontWeight: '700'
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Tiếp tục
                <ArrowRight size={18} />
              </div>
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '2.5rem', 
          paddingTop: '1.5rem', 
          borderTop: '0.5px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.05em' }}>
             © 2026 UTH - CÔNG NGHỆ THÔNG TIN
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
