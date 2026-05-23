import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Views
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Analytics from './pages/Analytics';
import Suggestions from './pages/Suggestions';
import Settings from './pages/Settings';

// Protected Layout Wrapper
const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F172A]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};

// Main App Router Setup
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Views */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Views */}
          <Route 
            path="/" 
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            } 
          />
          <Route 
            path="/habits" 
            element={
              <ProtectedLayout>
                <Habits />
              </ProtectedLayout>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedLayout>
                <Analytics />
              </ProtectedLayout>
            } 
          />
          <Route 
            path="/suggestions" 
            element={
              <ProtectedLayout>
                <Suggestions />
              </ProtectedLayout>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedLayout>
                <Settings />
              </ProtectedLayout>
            } 
          />

          {/* Redirect all unmatched routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
