import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import uthLogo from '../assets/logo.png';
import { 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  CheckSquare, 
  GitCommit, 
  LayoutDashboard,
  FileText,
  Layers,
  Activity,
  UserCircle,
  Database
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getLinks = () => {
    const role = user?.role?.toUpperCase() || '';
    const links = [];

    links.push({ icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' });

    if (role === 'ADMIN') {
      links.push({ isHeader: true, label: 'HỆ THỐNG' });
      links.push({ icon: <Users size={20} />, label: 'Người dùng', path: '/admin/users' });
      links.push({ icon: <Layers size={20} />, label: 'Quản lý Nhóm', path: '/admin/groups' });
      links.push({ icon: <Settings size={20} />, label: 'Cấu hình Jira/Git', path: '/admin/config' });
    } 
    
    if (role === 'TEACHER' || role === 'ADMIN') {
      links.push({ isHeader: true, label: 'GIÁM SÁT' });
      links.push({ icon: <Database size={20} />, label: 'Lớp học', path: '/teacher/classes' });
      links.push({ icon: <BarChart3 size={20} />, label: 'Báo cáo Tổng quát', path: '/teacher/reports' });
    }

    if (role === 'STUDENT') {
      links.push({ isHeader: true, label: 'CÔNG VIỆC' });
      links.push({ icon: <CheckSquare size={20} />, label: 'Nhiệm vụ Jira', path: '/member/tasks' });
      links.push({ icon: <GitCommit size={20} />, label: 'Lịch sử Commits', path: '/member/commits' });
      
      if (user?.groupRole === 'LEADER') {
        links.push({ icon: <Layers size={20} />, label: 'Quản lý Nhóm (Leader)', path: '/leader/tasks' });
        links.push({ icon: <Settings size={20} />, label: 'Cấu hình Dự án', path: '/admin/config' });
      }
    }

    links.push({ isHeader: true, label: 'PHÂN TÍCH' });
    links.push({ icon: <Activity size={20} />, label: 'Tiến độ Sprint', path: '/project/sprint' });
    links.push({ icon: <FileText size={20} />, label: 'Xuất Báo cáo', path: '/reports/generate' });

    return links;
  };

  const links = getLinks();

  return (
    <aside className="glass-card" style={{ 
      margin: '0.75rem', 
      height: 'calc(100vh - 1.5rem)', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '1.25rem',
      width: '260px',
      borderRight: '0.5px solid var(--glass-border)',
      position: 'sticky',
      top: '0.75rem',
      boxShadow: 'none'
    }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
        <div style={{ 
          width: '38px', 
          height: '38px', 
          borderRadius: '10px', 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }}>
          <img src={uthLogo} alt="UTH" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
        </div>
        <div>
          <h2 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '800', 
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            JiraGit <span style={{ color: 'var(--primary)' }}>Pro</span>
          </h2>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.05em' }}>MANAGEMENT</p>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
        <ul style={{ listStyle: 'none' }}>
          {links.map((link, index) => (
            link.isHeader ? (
              <li key={`header-${index}`} style={{ 
                margin: '1.25rem 0 0.5rem 0.5rem', 
                fontSize: '0.65rem', 
                fontWeight: '700', 
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                {link.label}
              </li>
            ) : (
              <li key={link.path} style={{ marginBottom: '0.25rem' }}>
                <Link 
                  to={link.path} 
                  className={location.pathname === link.path ? 'btn btn-primary' : ''}
                  style={{ 
                    width: '100%', 
                    justifyContent: 'flex-start', 
                    padding: '0.75rem 1rem', 
                    borderRadius: '10px',
                    color: location.pathname === link.path ? 'white' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.9rem',
                    fontWeight: location.pathname === link.path ? '700' : '500',
                    transition: 'var(--transition)',
                    background: location.pathname === link.path ? 'var(--primary)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== link.path) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== link.path) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ opacity: location.pathname === link.path ? 1 : 0.8, display: 'flex' }}>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            )
          ))}
        </ul>
      </nav>

      <div style={{ borderTop: '0.5px solid var(--glass-border)', paddingTop: '1.25rem', marginTop: '1rem' }}>


        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          marginBottom: '1.25rem',
          padding: '0 0.5rem'
        }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.05)',
            border: '0.5px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserCircle size={20} color="var(--text-secondary)" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{user?.hoTen || 'Người dùng'}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role || 'Vai trò'}</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="btn" 
          style={{ 
            width: '100%', 
            color: '#FF453A', 
            background: 'rgba(255, 69, 58, 0.1)',
            padding: '0.65rem',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
