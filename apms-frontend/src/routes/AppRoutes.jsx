import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import { AuthContext } from '../context/AuthContext';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';
import NotFoundPage from '../pages/auth/NotFoundPage';

// Dashboards
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import HodDashboard from '../pages/dashboard/HodDashboard';
import FacultyDashboard from '../pages/dashboard/FacultyDashboard';
import StudentDashboard from '../pages/dashboard/StudentDashboard';

// Projects & Certificates
import ProjectList from '../pages/projects/ProjectList';
import SubmissionForm from '../pages/student/SubmissionForm';
import VerifySubmissions from '../pages/faculty/VerifySubmissions';
import CertificatePreview from '../pages/certificates/CertificatePreview';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dynamic Dashboard based on role */}
        <Route path="dashboard" element={<DashboardRouter />} />

        {/* Admin Routes */}
        <Route
          path="faculty"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <div>Admin Faculty Management Page</div>
            </ProtectedRoute>
          }
        />

        {/* HOD Routes */}
        <Route
          path="department/faculty"
          element={
            <ProtectedRoute allowedRoles={['HOD']}>
              <div>HOD Department Faculty Page</div>
            </ProtectedRoute>
          }
        />

        {/* Principal Routes */}
        <Route
          path="analytics"
          element={
            <ProtectedRoute allowedRoles={['PRINCIPAL']}>
              <div>Principal Analytics Page</div>
            </ProtectedRoute>
          }
        />

        {/* Faculty Routes */}
        <Route
          path="projects"
          element={
            <ProtectedRoute allowedRoles={['FACULTY']}>
              <ProjectList />
            </ProtectedRoute>
          }
        />
        <Route
          path="students"
          element={
            <ProtectedRoute allowedRoles={['FACULTY']}>
              <div>Faculty Students Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="submissions"
          element={
            <ProtectedRoute allowedRoles={['FACULTY']}>
              <VerifySubmissions />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="my-project"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <SubmissionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="certificates"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <CertificatePreview />
            </ProtectedRoute>
          }
        />

        {/* Common Routes */}
        <Route
          path="meetings"
          element={
            <ProtectedRoute allowedRoles={['FACULTY', 'STUDENT']}>
              <div>Meetings Page</div>
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Helper component to route to correct dashboard
const DashboardRouter = () => {
  const { user } = React.useContext(AuthContext);
  
  switch (user?.role) {
    case 'ADMIN': return <AdminDashboard />;
    case 'HOD': return <HodDashboard />;
    case 'PRINCIPAL': return <div>Principal Dashboard</div>;
    case 'FACULTY': return <FacultyDashboard />;
    case 'STUDENT': return <StudentDashboard />;
    default: return <Navigate to="/login" replace />;
  }
};

export default AppRoutes;
