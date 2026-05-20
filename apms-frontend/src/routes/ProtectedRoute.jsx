import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';

// const ProtectedRoute = ({ children, allowedRoles = [] }) => {
//   const { user, isAuthenticated, loading } = useContext(AuthContext);
//   const location = useLocation();

//   if (loading) {
//     return <Loader message="Verifying access..." />;
//   }

//   if (!isAuthenticated || !user) {
//     // Redirect to login but save the attempted location
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
//     // Role not authorized, redirect to unauthorized page
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;


const ProtectedRoute = ({ children }) => {
  return children;
};

export default ProtectedRoute;