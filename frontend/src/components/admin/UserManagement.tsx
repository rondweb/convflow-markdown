import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified: boolean;
}

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  });

  const { showToast } = useToast();
  const API_BASE = import.meta.env.VITE_MARKDOWN_API_URL || 'http://localhost:8000';

  // Buscar usuário por username
  const searchUser = async (username: string) => {
    if (!username.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/search/${username}`);
      const data = await response.json();

      if (data.success) {
        setUsers([data.user]);
        showToast('Usuário encontrado!', 'success');
      } else {
        setUsers([]);
        showToast('Usuário não encontrado', 'error');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      showToast('Erro ao buscar usuário', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Criar novo usuário
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Usuário criado com sucesso!', 'success');
        setFormData({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          password: ''
        });
        setShowCreateForm(false);
        
        // Buscar o usuário recém-criado
        await searchUser(formData.username);
      } else {
        showToast(`Erro ao criar usuário: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      showToast('Erro ao criar usuário', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Atribuir role admin a um usuário
  const assignAdminRole = async (userId: string, username: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/assign-role/${userId}/admin`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        showToast(`Role admin atribuída a ${username}!`, 'success');
      } else {
        showToast(`Erro ao atribuir role: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Erro ao atribuir role:', error);
      showToast('Erro ao atribuir role', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-blue-100 mt-2">API Programática - Keycloak</p>
        </div>

        <div className="p-6">
          {/* Busca de usuários */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Buscar Usuário</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Digite o username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && searchUser(searchTerm)}
              />
              <button
                onClick={() => searchUser(searchTerm)}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Botão criar usuário */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              {showCreateForm ? 'Cancelar' : 'Criar Novo Usuário'}
            </button>
          </div>

          {/* Formulário de criação */}
          {showCreateForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Criar Novo Usuário</h3>
              <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Criando...' : 'Criar Usuário'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de usuários */}
          {users.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Usuários Encontrados</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.enabled 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.enabled ? 'Ativo' : 'Inativo'}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.emailVerified 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.emailVerified ? 'Verificado' : 'Não verificado'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => assignAdminRole(user.id, user.username)}
                            disabled={loading}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 disabled:opacity-50"
                          >
                            Tornar Admin
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Estado vazio */}
          {users.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">👥</div>
              <p className="text-gray-500">Nenhum usuário encontrado</p>
              <p className="text-gray-400 text-sm">Use a busca ou crie um novo usuário</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
