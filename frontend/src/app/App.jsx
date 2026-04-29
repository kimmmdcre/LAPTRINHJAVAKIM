import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../shared/context/AuthContext';
import { UIProvider } from '../shared/context/UIContext';
import Layout from '../shared/components/Layout';
import LoginPage from '../features/auth/pages/LoginPage';
import Dashboard from '../features/dashboard/pages/Dashboard';

import AdminUsers from '../features/users/pages/AdminUsers';
import AdminGroups from '../features/groups/pages/AdminGroups';
import AdminConfig from '../features/tasks/pages/AdminConfig';

import TeacherClasses from '../features/groups/pages/TeacherClasses';
import TeacherReports from '../features/reports/pages/TeacherReports';
import SprintProgress from '../features/reports/pages/SprintProgress';
import ContributionTracking from '../features/reports/pages/ContributionTracking';

import MemberTasks from '../features/tasks/pages/MemberTasks';
import MemberCommits from '../features/tasks/pages/MemberCommits';
import LeaderTasks from '../features/tasks/pages/LeaderTasks';
import ReportGenerator from '../features/reports/pages/ReportGenerator';
import PersonalProfile from '../features/users/pages/PersonalProfile';

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
            
            <Route path="/project/sprint" element={<SprintProgress />} />
            <Route path="/project/heatmap" element={<ContributionTracking />} />
            
            <Route path="/reports/generate" element={<ReportGenerator />} />
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
