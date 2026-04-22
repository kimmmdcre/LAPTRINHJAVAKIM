import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
      background: '#0a0a0f'
    }}>
      {/* Background Image with Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url("/assets/login-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(30px) brightness(0.6)',
        transform: 'scale(1.1)',
        zIndex: 0
      }}></div>
      
      {/* Dynamic Gradient Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, transparent 0%, rgba(10, 10, 15, 0.8) 100%)',
        zIndex: 1
      }}></div>

      {/* Floating Decorative Elements */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', opacity: 0.2, zIndex: 1 }} className="animate-pulse">
        <Cpu size={120} color="var(--primary)" />
      </div>
      <div style={{ position: 'absolute', bottom: '15%', right: '12%', opacity: 0.15, zIndex: 1 }} className="animate-pulse">
        <Globe size={180} color="var(--accent)" />
      </div>

      {/* Main Login Card */}
      <div className="glass-card animate-scale-in" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '3.5rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.6), 0 0 50px rgba(99, 102, 241, 0.1)'
      }}>
        {/* Logo Hub */}
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          margin: '0 auto 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px var(--primary-glow)',
          transform: 'rotate(-5deg)',
          position: 'relative'
        }} className="animate-float">
          <ShieldCheck color="white" size={42} />
          <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Zap size={14} fill="currentColor" />
          </div>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.04em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          JiraGit NEXUS
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1rem', fontWeight: '500' }}>
          Cổng điều phối dự án thông minh
        </p>

        {error && (
          <div className="glass-card animate-slide-up" style={{
            padding: '1rem',
            marginBottom: '2rem',
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.875rem',
            fontWeight: '600',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderLeft: '4px solid var(--danger)'
          }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="input-group">
            <label className="input-label" style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>Tên đăng nhập hệ thống</label>
            <div style={{ position: 'relative' }}>
              <User size={19} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '48px', height: '56px', background: 'rgba(255,255,255,0.03)', fontSize: '1rem' }}
                placeholder="Nhập username của bạn..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
               <label className="input-label" style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>Mật khẩu bảo mật</label>
               <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}>Quên mật khẩu?</span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={19} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                style={{ paddingLeft: '48px', paddingRight: '52px', height: '56px', background: 'rgba(255,255,255,0.03)', fontSize: '1rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-hover"
            style={{ 
                width: '100%', 
                height: '58px', 
                fontSize: '1.1rem', 
                fontWeight: '800', 
                letterSpacing: '0.02em', 
                boxShadow: '0 15px 30px rgba(99, 102, 241, 0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                Khởi động Workspace
                <ArrowRight size={20} />
              </div>
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '3.5rem', 
          paddingTop: '2rem', 
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', color: 'var(--text-muted)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
                <GitIcon size={18} />
                GitHub
             </div>
             <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.1)', alignSelf: 'center' }}></div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
                <span style={{ color: 'var(--primary)' }}>Jira</span>
                Connector
             </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
             © 2024 Advanced Project System
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
          100% { transform: translateY(0px) rotate(-5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .input-field:focus {
           background: rgba(255,255,255,0.06) !important;
           border-color: var(--primary) !important;
           box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
