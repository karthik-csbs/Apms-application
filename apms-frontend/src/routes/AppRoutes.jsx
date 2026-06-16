import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import { AuthContext } from '../context/AuthContext';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';
import NotFoundPage from '../pages/auth/NotFoundPage';
import ProfilePage from '../pages/auth/ProfilePage';

// Dashboards
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import HodDashboard from '../pages/dashboard/HodDashboard';
import FacultyDashboard from '../pages/dashboard/FacultyDashboard';
import StudentDashboard from '../pages/dashboard/StudentDashboard';

// Projects & Certificates
import ProjectList from '../pages/projects/ProjectList';
import MyProject from '../pages/student/MyProject';
import VerifySubmissions from '../pages/faculty/VerifySubmissions';
import CertificatePreview from '../pages/certificates/CertificatePreview';
import CreateStudents from '../pages/student/createstudent';

// Newly Implemented Pages
import AdminUserManagement from '../pages/admin/AdminUserManagement';
import HodFacultyPage from '../pages/hod/HodFacultyPage';
import PrincipalAnalyticsPage from '../pages/principal/PrincipalAnalyticsPage';
import FacultyStudentsPage from '../pages/faculty/FacultyStudentsPage';
import MeetingsPage from '../pages/meetings/MeetingsPage';
import ReportsPage from '../pages/reports/ReportsPage';

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
              <AdminUserManagement />
            </ProtectedRoute>
          }
        />

        {/* HOD Routes */}
        <Route
          path="department/faculty"
          element={
            <ProtectedRoute allowedRoles={['HOD']}>
              <HodFacultyPage />
            </ProtectedRoute>
          }
        />

        {/* Principal Routes */}
        <Route
          path="analytics"
          element={
            <ProtectedRoute allowedRoles={['PRINCIPAL']}>
              <PrincipalAnalyticsPage />
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
              <FacultyStudentsPage />
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
            <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'HOD', 'PRINCIPAL']}>
              <MyProject />
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
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'PRINCIPAL', 'FACULTY']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'PRINCIPAL', 'FACULTY', 'STUDENT']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="meetings"
          element={
            <ProtectedRoute allowedRoles={['FACULTY', 'STUDENT']}>
              <MeetingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="create-students"
          element={
            <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
              <CreateStudents/>
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
    case 'PRINCIPAL': return <PrincipalAnalyticsPage />;
    case 'FACULTY': return <FacultyDashboard />;
    case 'STUDENT': return <StudentDashboard />;
    default: return <Navigate to="/login" replace />;
  }
};

export default AppRoutes;
