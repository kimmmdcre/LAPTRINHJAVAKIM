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
  Kanban
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getLinks = () => {
    const role = user?.role;
    const links = [];

    // Common dashboard link
    links.push({ icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' });

    if (role === 'ADMIN') {
      links.push({ icon: <Users size={20} />, label: 'Quản lý Người dùng', path: '/admin/users' });
      links.push({ icon: <Layers size={20} />, label: 'Quản lý Nhóm', path: '/admin/groups' });
      links.push({ icon: <Settings size={20} />, label: 'Cấu hình HT', path: '/admin/config' });
    } else if (role === 'GIANG_VIEN') {
      links.push({ icon: <Users size={20} />, label: 'Quản lý Sinh viên', path: '/teacher/classes' });
      links.push({ icon: <BarChart3 size={20} />, label: 'Báo cáo Tiến độ', path: '/teacher/reports' });
    } else if (role === 'SINH_VIEN' || role === 'TRUONG_NHOM') {
      links.push({ icon: <CheckSquare size={20} />, label: 'Nhiệm vụ cá nhân', path: '/member/tasks' });
      links.push({ icon: <GitCommit size={20} />, label: 'Đóng góp Git', path: '/member/commits' });
      
      if (role === 'TRUONG_NHOM') {
        links.push({ icon: <Kanban size={20} />, label: 'Bảng Nhiệm vụ Nhóm', path: '/leader/tasks' });
      }
    }

    return links;
  };

  return (
    <aside className="glass-card" style={{ 
      margin: '1rem', 
      height: 'calc(100vh - 2rem)', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '1.5rem',
      width: '260px'
    }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '10px', 
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <GitCommit color="white" size={24} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          JiraGit Support
        </h2>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none' }}>
          {getLinks().map((link) => (
            <li key={link.path} style={{ marginBottom: '0.5rem' }}>
              <Link 
                to={link.path} 
                className={`btn ${location.pathname === link.path ? 'btn-primary' : 'btn-outline'}`}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                {link.icon}
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user?.hoTen}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.role}</p>
        </div>
        <button 
          onClick={logout} 
          className="btn btn-outline" 
          style={{ width: '100%', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
