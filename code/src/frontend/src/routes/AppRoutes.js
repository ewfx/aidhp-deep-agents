import React, { useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../components/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import OnboardingChatPage from '../pages/OnboardingChatPage';

// Protected route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading instead of redirecting while auth state is being determined
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Protected route that automatically directs user to appropriate page based on onboarding status
const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  // Check onboarding status on mount
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const onboardingCompleted = localStorage.getItem('onboarding_completed');
      
      // If onboarding not completed and not already on onboarding page, redirect to onboarding
      if (onboardingCompleted !== 'true' && window.location.pathname !== '/onboarding') {
        navigate('/onboarding');
      }
    }
  }, [isAuthenticated, loading, navigate]);
  
  // Show loading instead of redirecting while auth state is being determined
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LoginPage />} />
      
      {/* Onboarding route (protected) */}
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <OnboardingChatPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Dashboard route (protected with automatic redirection) */}
      <Route 
        path="/dashboard" 
        element={
          <AuthenticatedRoute>
            <DashboardPage />
          </AuthenticatedRoute>
        } 
      />
      
      {/* Redirect all other routes to dashboard if logged in, or login page if not */}
      <Route 
        path="*" 
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes; 