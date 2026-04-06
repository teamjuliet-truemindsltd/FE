import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../contexts/authContext';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import VerifyOtpPage from '../pages/VerifyOtpPage';
import DashboardPage from '../pages/DashboardPage';
import CoursesPage from '../pages/CoursesPage';
import CourseDetailsPage from '../pages/CourseDetailsPage';
import MyCoursesPage from '../pages/MyCoursesPage';
import LessonViewerPage from '../pages/LessonViewerPage';
import DiscussionsPage from '../pages/DiscussionsPage';
import InstructorDashboardPage from '../pages/InstructorDashboardPage';
import LandingPage from '../pages/LandingPage';

const Router: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />

        {/* Auth Routes */}
        <Route path="/auth/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/auth/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/auth/verify-otp" element={isAuthenticated ? <Navigate to="/dashboard" /> : <VerifyOtpPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><CourseDetailsPage /></ProtectedRoute>} />
        <Route path="/my-courses" element={<ProtectedRoute><MyCoursesPage /></ProtectedRoute>} />
        <Route path="/lessons/:id" element={<ProtectedRoute><LessonViewerPage /></ProtectedRoute>} />
        <Route path="/discussions" element={<ProtectedRoute><DiscussionsPage /></ProtectedRoute>} />
        <Route path="/instructor" element={<ProtectedRoute><InstructorDashboardPage /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
