import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

import AdminUsers from './pages/AdminUsers';
import AdminGroups from './pages/AdminGroups';
import AdminConfig from './pages/AdminConfig';

import TeacherClasses from './pages/TeacherClasses';
import TeacherReports from './pages/TeacherReports';
import SprintProgress from './pages/SprintProgress';
import ContributionTracking from './pages/ContributionTracking';

import MemberTasks from './pages/MemberTasks';
import MemberCommits from './pages/MemberCommits';
import LeaderTasks from './pages/LeaderTasks';
import ReportGenerator from './pages/ReportGenerator';
import PersonalProfile from './pages/PersonalProfile';

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
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/groups" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminGroups /></ProtectedRoute>} />
            <Route path="/admin/config" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminConfig /></ProtectedRoute>} />
            
            {/* Teacher Routes */}
            <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><TeacherClasses /></ProtectedRoute>} />
            <Route path="/teacher/reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><TeacherReports /></ProtectedRoute>} />
            
            {/* Member Routes */}
            <Route path="/member/tasks" element={<MemberTasks />} />
            <Route path="/member/commits" element={<MemberCommits />} />
            
            <Route path="/project/sprint" element={<SprintProgress />} />
            <Route path="/project/heatmap" element={<ContributionTracking />} />
            
            <Route path="/profile" element={<PersonalProfile />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </UIProvider>
    </Router>
  );
}

export default App;
