import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useKeycloakAuth } from '../contexts/KeycloakAuthContext';
import { useToast } from '../contexts/ToastContext';

const Login: React.FC = () => {
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

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Starting authentication...');
      await login();
      // O usuário será redirecionado para o Keycloak, então o sucesso será tratado na volta
      console.log('Login initiated, redirecting to authentication server...');
    } catch (error) {
      console.error('Authentication failed:', error);
      addToast('Failed to initiate login. Please check your connection.', 'error');
      setIsLoading(false);
    }
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
          
          {/* Authentication Button */}
          <div className="mt-8">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
            <p className="mt-3 text-xs text-gray-600 text-center">
              Secure authentication powered by our identity service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
