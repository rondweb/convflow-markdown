import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { KeycloakAuthProvider } from './contexts/KeycloakAuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import KeycloakDebug from './components/common/KeycloakDebug';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import History from './pages/History';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Toast from './components/common/Toast';

function App() {
  return (
    <KeycloakAuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
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
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
            <Toast />
            <KeycloakDebug />
          </div>
        </Router>
      </ToastProvider>
    </KeycloakAuthProvider>
  );
}

export default App;