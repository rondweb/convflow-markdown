import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useKeycloakAuth } from '../contexts/KeycloakAuthContext';
import { useToast } from '../contexts/ToastContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isAuthenticated } = useKeycloakAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleKeycloakLogin = async () => {
    try {
      setIsLoading(true);
      await login();
      addToast('Login successful! Redirecting...', 'success');
    } catch (error) {
      console.error('Keycloak login failed:', error);
      addToast('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Please use Keycloak authentication for secure login.', 'info');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
          
          {/* Keycloak Authentication */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-3">🔐 Secure Authentication</h3>
            <button
              onClick={handleKeycloakLogin}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </div>
              ) : (
                'Sign in with Keycloak'
              )}
            </button>
            <p className="mt-2 text-xs text-blue-600 text-center">
              Centralized authentication for enhanced security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
