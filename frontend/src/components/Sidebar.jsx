import React from 'react';
import { useAuth } from '../context/AuthContext';
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
      margin: '1rem', 
      height: 'calc(100vh - 2rem)', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '1.5rem',
      width: '280px',
      borderRight: '1px solid var(--glass-border)',
      position: 'sticky',
      top: '1rem'
    }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
        <div style={{ 
          width: '42px', 
          height: '42px', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px var(--primary-glow)'
        }}>
          <GitCommit color="white" size={24} />
        </div>
        <div>
          <h2 style={{ 
            fontSize: '1.2rem', 
            fontWeight: '800', 
            color: 'white',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            JiraGit <span style={{ color: 'var(--primary)' }}>Pro</span>
          </h2>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '0.1em' }}>MANAGEMENT SYSTEM</p>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
        <ul style={{ listStyle: 'none' }}>
          {links.map((link, index) => (
            link.isHeader ? (
              <li key={`header-${index}`} style={{ 
                margin: '1.5rem 0 0.75rem 0.75rem', 
                fontSize: '0.7rem', 
                fontWeight: '800', 
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}>
                {link.label}
              </li>
            ) : (
              <li key={link.path} style={{ marginBottom: '0.5rem' }}>
                <Link 
                  to={link.path} 
                  className={`btn ${location.pathname === link.path ? 'btn-primary' : 'btn-outline'}`}
                  style={{ 
                    width: '100%', 
                    justifyContent: 'flex-start', 
                    padding: '0.8rem 1.2rem', 
                    border: location.pathname === link.path ? 'none' : '1px solid transparent',
                    background: location.pathname === link.path ? '' : 'transparent'
                  }}
                >
                  <span style={{ opacity: location.pathname === link.path ? 1 : 0.7 }}>{link.icon}</span>
                  <span style={{ fontSize: '0.9rem' }}>{link.label}</span>
                </Link>
              </li>
            )
          ))}
        </ul>
      </nav>

      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          marginBottom: '1.5rem',
          padding: '0 0.5rem'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'var(--glass)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserCircle size={24} color="var(--text-secondary)" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.hoTen || 'Người dùng'}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role || 'Vai trò'}</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="btn btn-outline" 
          style={{ 
            width: '100%', 
            color: 'var(--danger)', 
            borderColor: 'rgba(239, 68, 68, 0.15)',
            background: 'rgba(239, 68, 68, 0.05)'
          }}
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
