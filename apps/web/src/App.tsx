import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@mediflux/auth';
import { ErrorBoundary } from '@mediflux/ui';
import type { User as MediFluxUser } from '@mediflux/types';

import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import PatientList from './modules/patients/PatientList';
import AnalyticsDashboard from './modules/analytics/AnalyticsDashboard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#0A0A0B' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(94,106,210,0.3)', borderTopColor: '#5e6ad2' }} />
        <p className="text-sm" style={{ color: '#8b8d98' }}>Loading MediFlux...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Restore fallback session from localStorage (works after hard refresh)
    const stored = localStorage.getItem('mediflux_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
        setLoading(false);
        return; // Don't wait for Firebase if we have a cached session
      } catch {
        localStorage.removeItem('mediflux_user');
      }
    }

    // Try Firebase auth state for real Google login sessions
    let unsubscribeFn: (() => void) | undefined;
    import('@mediflux/firebase').then(({ auth }) => {
      unsubscribeFn = auth.onAuthStateChanged((firebaseUser: any) => {
        if (firebaseUser) {
          const u: MediFluxUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            role: 'admin' as const,
          };
          setUser(u);
          localStorage.setItem('mediflux_user', JSON.stringify(u));
        }
        setLoading(false);
      });
    }).catch(() => {
      // Firebase unavailable — fallback mode only
      setLoading(false);
    });

    return () => { if (unsubscribeFn) unsubscribeFn(); };
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary name="Application Shell">
                  <Outlet />
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
