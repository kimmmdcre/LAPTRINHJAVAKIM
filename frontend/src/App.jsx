import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AdminUsers from './pages/AdminUsers';
import AdminGroups from './pages/AdminGroups';
import AdminConfig from './pages/AdminConfig';
import TeacherReports from './pages/TeacherReports';
import TeacherClasses from './pages/TeacherClasses';
import MemberTasks from './pages/MemberTasks';
import MemberCommits from './pages/MemberCommits';
import LeaderTasks from './pages/LeaderTasks';

// Dashboard landing page
const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Chào {user?.hoTen}! 🚀</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Bạn đang đăng nhập với vai trò <strong>{user?.role}</strong>. 
          Chọn các chức năng từ menu bên trái để bắt đầu làm việc.
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
    <UIProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Admin Routes */}
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/groups" element={<AdminGroups />} />
            <Route path="/admin/config" element={<AdminConfig />} />
            
            {/* Teacher Routes */}
            <Route path="/teacher/classes" element={<TeacherClasses />} />
            <Route path="/teacher/reports" element={<TeacherReports />} />
            
            {/* Member & Leader Routes */}
            <Route path="/member/tasks" element={<MemberTasks />} />
            <Route path="/member/commits" element={<MemberCommits />} />
            <Route path="/leader/tasks" element={<LeaderTasks />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </UIProvider>
    </Router>
  );
}

export default App;
