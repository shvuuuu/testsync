import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSupabase } from './lib/supabase/SupabaseProvider';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import TestCases from './pages/TestCases';
import SharedSteps from './pages/SharedSteps';
import TestRuns from './pages/TestRuns';
import TestPlans from './pages/TestPlans';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import TestCaseDetail from './pages/TestCaseDetail';
import TestRunDetail from './pages/TestRunDetail';
import NotFound from './pages/NotFound';

function App() {
  const { supabase, session } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      try {
        setIsLoading(true);
        // Session is already handled by the SupabaseProvider
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Protected Routes */}
      <Route element={<ProtectedRoute session={session} />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test-cases" element={<TestCases />} />
          <Route path="/test-cases/:id" element={<TestCaseDetail />} />
          <Route path="/shared-steps" element={<SharedSteps />} />
          <Route path="/test-runs" element={<TestRuns />} />
          <Route path="/test-runs/:id" element={<TestRunDetail />} />
          <Route path="/test-plans" element={<TestPlans />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Auth Routes */}
      <Route element={<PublicRoute session={session} />}>
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Route guards
const ProtectedRoute = ({ session }: { session: any }) => {
  if (!session) {
    return <Navigate to="/auth/login" replace />;
  }
  return <Outlet />;
};

const PublicRoute = ({ session }: { session: any }) => {
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

import { Outlet } from 'react-router-dom';

export default App;