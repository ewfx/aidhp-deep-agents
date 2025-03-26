import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../components/LoginPage';
import OnboardingChatPage from '../pages/OnboardingChatPage';
import DashboardPage from '../pages/DashboardPage';
import AdvisoryDocumentsPage from '../pages/AdvisoryDocumentsPage';
import AdvisoryDocumentPage from '../pages/AdvisoryDocumentPage';
import RecommendationDetailPage from '../pages/RecommendationDetailPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If authentication is still loading, show nothing (or a loading spinner)
  if (isLoading) {
    return null;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If authenticated, show the protected component
  return children;
};

// Authenticated route with onboarding check 
const AuthenticatedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // If still loading user data, show nothing
  if (isLoading) {
    return null;
  }
  
  // Check if onboarding is completed using localStorage
  const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
  
  // Check if onboarding is completed, if not redirect to onboarding
  if (user && !onboardingCompleted) {
    console.log('Onboarding not completed, redirecting to onboarding page');
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingChatPage />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AuthenticatedRoute>
            <DashboardPage />
          </AuthenticatedRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/advisory-documents" element={
        <ProtectedRoute>
          <AuthenticatedRoute>
            <AdvisoryDocumentsPage />
          </AuthenticatedRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/advisory-documents/:id" element={
        <ProtectedRoute>
          <AuthenticatedRoute>
            <AdvisoryDocumentPage />
          </AuthenticatedRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/recommendations/:id" element={
        <ProtectedRoute>
          <AuthenticatedRoute>
            <RecommendationDetailPage />
          </AuthenticatedRoute>
        </ProtectedRoute>
      } />
      
      {/* Catch-all redirect */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  );
};

export default AppRoutes; 