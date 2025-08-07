import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useKeycloakAuth } from '../contexts/KeycloakAuthContext';
import { useToast } from '../contexts/ToastContext';

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, user, isAuthenticated } = useKeycloakAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      console.log('Starting registration process...');
      await register();
      // O usuário será redirecionado para o Keycloak, então o sucesso será tratado na volta
      console.log('Registration initiated, redirecting to authentication server...');
    } catch (error) {
      console.error('Registration failed:', error);
      addToast('Failed to initiate registration. Please check your connection.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
          
          {/* Registration Button */}
          <div className="mt-8">
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
            <p className="mt-3 text-xs text-gray-600 text-center">
              Secure registration powered by our identity service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
