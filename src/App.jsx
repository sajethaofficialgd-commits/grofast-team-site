import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AttendancePage from './pages/AttendancePage';
import TeamsPage from './pages/TeamsPage';
import ChatPage from './pages/ChatPage';
import MeetingsPage from './pages/MeetingsPage';
import DailyUpdatePage from './pages/DailyUpdatePage';
import LearningBoardPage from './pages/LearningBoardPage';
import ProgressionBoardPage from './pages/ProgressionBoardPage';
import AppointmentsPage from './pages/AppointmentsPage';
import LeavePage from './pages/LeavePage';
import ProfilePage from './pages/ProfilePage';
import AdminPanelPage from './pages/AdminPanelPage';
import ReportsPage from './pages/ReportsPage';

import './index.css';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div className="loading-spinner" style={{ width: 48, height: 48 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route wrapper (redirect to dashboard if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div className="loading-spinner" style={{ width: 48, height: 48 }} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes with Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/daily-update" element={<DailyUpdatePage />} />
        <Route path="/learning-board" element={<LearningBoardPage />} />
        <Route path="/progression-board" element={<ProgressionBoardPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin-panel" element={<AdminPanelPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/calendar" element={<MeetingsPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
