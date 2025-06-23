import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoutes = () => {
  const user = JSON.parse(localStorage.getItem('switchstack-user') || 'null');

  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to='/login' replace />;
  }

  // If user is authenticated, render the child components
  return <Outlet />;
};

export default ProtectedRoutes;
