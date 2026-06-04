import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Suspense, lazy } from 'react';
import store from './store';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute, AdminRoute } from './components/RouteGuards';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Sleep from './pages/Sleep';
import Hydration from './pages/Hydration';
import Wellness from './pages/Wellness';
import Goals from './pages/Goals';
import Challenges from './pages/Challenges';
import Notifications from './pages/Notifications';
import History from './pages/History';
import Profile from './pages/Profile';

// Code-split heavy routes
const Progress = lazy(() => import('./pages/Progress'));
const Admin = lazy(() => import('./pages/Admin'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-pulse text-emerald-400 text-lg">Loading...</div>
  </div>
);

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="activity" element={<Activity />} />
                  <Route path="sleep" element={<Sleep />} />
                  <Route path="hydration" element={<Hydration />} />
                  <Route path="wellness" element={<Wellness />} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="progress" element={<Suspense fallback={<LoadingFallback />}><Progress /></Suspense>} />
                  <Route path="challenges" element={<Challenges />} />
                  <Route path="challenges/:id" element={<Challenges />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="history" element={<History />} />
                  <Route path="profile" element={<Profile />} />

                  {/* Admin routes */}
                  <Route path="admin" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><Admin /></Suspense></AdminRoute>} />
                  <Route path="admin/users" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><Admin /></Suspense></AdminRoute>} />
                  <Route path="admin/reports" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><Admin /></Suspense></AdminRoute>} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
