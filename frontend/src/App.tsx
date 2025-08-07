import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { StackHandler, StackProvider, StackTheme } from '@stackframe/react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { stackClientApp } from './stack';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import History from './pages/History';
import Settings from './pages/Settings';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Toast from './components/common/Toast';

// Handler routes for Neon Auth SDK
function HandlerRoutes() {
  const location = useLocation();
  return (
    <StackHandler app={stackClientApp} location={location.pathname} fullPage />
  );
}

function App() {
  return (
    <Suspense fallback={null}>
      <Router>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <AuthProvider>
              <ToastProvider>
                <div className="min-h-screen bg-gray-50 flex flex-col">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      {/* Neon Auth handler routes */}
                      <Route path="/handler/*" element={<HandlerRoutes />} />
                      
                      {/* Existing app routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/history" element={
                        <ProtectedRoute>
                          <History />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </main>
                  <Footer />
                  <Toast />
                </div>
              </ToastProvider>
            </AuthProvider>
          </StackTheme>
        </StackProvider>
      </Router>
    </Suspense>
  );
}

export default App;