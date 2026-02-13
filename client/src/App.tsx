import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import { UserProvider, useUser } from './hooks/useUser';

// Lazy-load pages for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Checkin = lazy(() => import('./pages/Checkin'));
const Report = lazy(() => import('./pages/Report'));
const Feedback = lazy(() => import('./pages/Feedback'));

// Protected route — redirects to onboarding if not logged in
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  if (!user) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/checkin" element={<ProtectedRoute><Checkin /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
