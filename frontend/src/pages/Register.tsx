import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useKeycloakAuth } from '../contexts/KeycloakAuthContext';
import { useToast } from '../contexts/ToastContext';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleKeycloakRegister = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Keycloak registration...');
      await register(); // Usar a função específica de registro
      // O usuário será redirecionado para o Keycloak, então o sucesso será tratado na volta
      console.log('Registration initiated, redirecting to Keycloak...');
    } catch (error) {
      console.error('Keycloak registration failed:', error);
      addToast('Failed to initiate registration. Please check your connection.', 'error');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Please use Keycloak for secure registration. Click "Sign up with Keycloak" above.', 'info');
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
          
          {/* Keycloak Authentication */}
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-3">🔐 Secure Registration</h3>
            <button
              onClick={handleKeycloakRegister}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </div>
              ) : (
                'Sign up with Keycloak'
              )}
            </button>
            <p className="mt-2 text-xs text-green-600 text-center">
              Centralized registration for enhanced security
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Register;
