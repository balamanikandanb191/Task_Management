import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import AppLayout from '../components/layout/AppLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';

// Dashboard actual implementatons (to be created)
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminProjects from '../pages/admin/AdminProjects';
import AdminReports from '../pages/admin/AdminReports';
import AdminLogs from '../pages/admin/AdminLogs';
import AdminTasks from '../pages/admin/AdminTasks';
import AdminTeams from '../pages/admin/AdminTeams';
import PMDashboard from '../pages/pm/PMDashboard';
import PMProjects from '../pages/pm/PMProjects';
import PMCreateProject from '../pages/pm/PMCreateProject';
import PMTeams from '../pages/pm/PMTeams';
import PMTasks from '../pages/pm/PMTasks';
import PMReports from '../pages/pm/PMReports';
import TLDashboard from '../pages/tl/TLDashboard';
import TLProjects from '../pages/tl/TLProjects';
import TLTasks from '../pages/tl/TLTasks';
import TLMyTasks from '../pages/tl/TLMyTasks';
import TLMembers from '../pages/tl/TLMembers';
import TLApprovals from '../pages/tl/TLApprovals';
import TLDocumentation from '../pages/tl/TLDocumentation';
import ProjectReports from '../pages/pm/ProjectReports';
import ProjectDocumentation from '../pages/shared/ProjectDocumentation';
import Notifications from '../pages/shared/Notifications';
import TMDashboard from '../pages/tm/TMDashboard';
import TMTasks from '../pages/tm/TMTasks';
import TMUpload from '../pages/tm/TMUpload';
import TMHistory from '../pages/tm/TMHistory';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'admin') return <Navigate to="/" />;
  
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminUsers /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/projects" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminProjects /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminReports /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/logs" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminLogs /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/tasks" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminTasks /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/teams" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminTeams /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/documentation" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><ProjectDocumentation /></AppLayout>
        </ProtectedRoute>
      } />

      {/* PM Routes */}
      <Route path="/pm" element={
        <ProtectedRoute allowedRoles={['project_manager']}>
          <AppLayout><PMDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/pm/projects" element={
        <ProtectedRoute allowedRoles={['project_manager']}>
          <AppLayout><PMProjects /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/pm/projects/create" element={
        <ProtectedRoute allowedRoles={['project_manager']}>
          <AppLayout><PMCreateProject /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/pm/teams" element={
        <ProtectedRoute allowedRoles={['project_manager']}>
          <AppLayout><PMTeams /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/pm/task-overview" element={
        <ProtectedRoute allowedRoles={['project_manager']}>
          <AppLayout><PMTasks /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/pm/reports" element={
        <ProtectedRoute allowedRoles={['project_manager']}>
          <AppLayout><PMReports /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/pm/documentation" element={
        <ProtectedRoute allowedRoles={['project_manager']}>
          <AppLayout><ProjectDocumentation /></AppLayout>
        </ProtectedRoute>
      } />

      {/* TL Routes */}
      <Route path="/tl" element={
        <ProtectedRoute allowedRoles={['team_leader']}>
          <AppLayout><TLDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/tl/projects" element={
        <ProtectedRoute allowedRoles={['team_leader']}>
          <AppLayout><TLProjects /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/tl/tasks" element={
        <ProtectedRoute allowedRoles={['team_leader']}>
          <AppLayout><TLTasks /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/tl/my-tasks" element={
        <ProtectedRoute allowedRoles={['team_leader']}>
          <AppLayout><TLMyTasks /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/tl/members" element={
        <ProtectedRoute allowedRoles={['team_leader']}>
          <AppLayout><TLMembers /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/tl/approvals" element={
        <ProtectedRoute allowedRoles={['team_leader']}>
          <AppLayout><TLApprovals /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/tl/documentation" element={
        <ProtectedRoute allowedRoles={['team_leader']}>
          <AppLayout><TLDocumentation /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Shared Reporting Routes */}
      <Route path="/pm/reports/projects" element={
        <ProtectedRoute allowedRoles={['admin', 'project_manager']}>
          <AppLayout><ProjectReports /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports/projects" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><ProjectReports /></AppLayout>
        </ProtectedRoute>
      } />

      {/* TM Routes */}
      <Route path="/tm" element={
        <ProtectedRoute allowedRoles={['team_member']}>
          <AppLayout><TMDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/tm/my-tasks" element={
        <ProtectedRoute allowedRoles={['team_member']}>
          <AppLayout><TMTasks /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/tm/upload" element={
        <ProtectedRoute allowedRoles={['team_member']}>
          <AppLayout><TMUpload /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/tm/history" element={
        <ProtectedRoute allowedRoles={['team_member']}>
          <AppLayout><TMHistory /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Shared Common Routes */}
      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppLayout><Notifications /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
