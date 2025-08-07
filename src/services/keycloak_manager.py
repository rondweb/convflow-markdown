import os
import requests
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class KeycloakUserManager:
    """
    Gerenciador de usuários do Keycloak via API REST
    Conecta com o Keycloak usando as configurações do .env
    """
    
    def __init__(self):
        self.base_url = os.getenv('VITE_KEYCLOAK_URL_BASE')
        self.realm = os.getenv('VITE_KEYCLOAK_REALM')
        self.client_id = os.getenv('VITE_KEYCLOAK_CLIENT_ID') 
        self.client_secret = os.getenv('VITE_KEYCLOAK_CLIENT_SECRET')
        self.admin_token = None
        
        # URLs importantes
        if self.base_url and self.realm:
            self.token_url = f"{self.base_url}/realms/{self.realm}/protocol/openid-connect/token"
            self.admin_url = f"{self.base_url}/admin/realms/{self.realm}"
        
        # Validar configurações
        if not all([self.base_url, self.realm, self.client_id, self.client_secret]):
            raise ValueError("Configurações do Keycloak incompletas no .env")
    
    def get_admin_token(self) -> str:
        """
        Obtém token de administrador para usar a API Admin do Keycloak
        """
        # Para Keycloak v26+, usar o endpoint no realm correto
        url = f"{self.base_url}/realms/master/protocol/openid-connect/token"
        
        # Tentar com client credentials do nosso client
        data = {
            'grant_type': 'client_credentials',
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        
        try:
            logger.info(f"Tentando obter token admin: {url}")
            response = requests.post(url, data=data, timeout=10)
            
            if response.status_code == 200:
                token_data = response.json()
                self.admin_token = token_data['access_token']
                logger.info("Token admin obtido com sucesso")
                return self.admin_token
            else:
                # Se falhar, tentar com admin-cli (cliente padrão)
                data['client_id'] = 'admin-cli'
                response = requests.post(url, data=data, timeout=10)
                
                if response.status_code == 200:
                    token_data = response.json()
                    self.admin_token = token_data['access_token']
                    logger.info("Token admin obtido com admin-cli")
                    return self.admin_token
                else:
                    error_msg = f"Erro ao obter token admin: {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    raise Exception(error_msg)
                    
        except requests.RequestException as e:
            error_msg = f"Erro de conexão ao obter token: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg)
    
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria um novo usuário no Keycloak
        
        Args:
            user_data: {
                'username': 'user123',
                'email': 'user@example.com',
                'firstName': 'Nome',
                'lastName': 'Sobrenome',
                'password': 'senha123',
                'emailVerified': True,
                'enabled': True
            }
        """
        if not self.admin_token:
            self.get_admin_token()
            
        url = f"{self.admin_url}/users"
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}',
            'Content-Type': 'application/json'
        }
        
        # Preparar dados do usuário
        keycloak_user = {
            'username': user_data['username'],
            'email': user_data['email'],
            'firstName': user_data.get('firstName', ''),
            'lastName': user_data.get('lastName', ''),
            'emailVerified': user_data.get('emailVerified', True),
            'enabled': user_data.get('enabled', True),
            'attributes': user_data.get('attributes', {}),
            'groups': [],
            'requiredActions': []
        }
        
        try:
            logger.info(f"Criando usuário: {user_data['username']}")
            response = requests.post(url, json=keycloak_user, headers=headers, timeout=10)
            
            if response.status_code == 201:
                # Usuário criado com sucesso
                location = response.headers.get('Location', '')
                user_id = location.split('/')[-1] if location else None
                
                # Definir senha se fornecida
                if 'password' in user_data and user_id:
                    self.set_user_password(user_id, user_data['password'])
                
                # Atribuir roles se fornecidas
                if 'roles' in user_data and user_id:
                    for role in user_data['roles']:
                        self.assign_role_to_user(user_id, role)
                
                logger.info(f"Usuário criado com sucesso: {user_id}")
                return {'success': True, 'user_id': user_id}
            else:
                error_msg = f"Erro ao criar usuário: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return {'success': False, 'error': error_msg}
                
        except requests.RequestException as e:
            error_msg = f"Erro de conexão ao criar usuário: {str(e)}"
            logger.error(error_msg)
            return {'success': False, 'error': error_msg}
    
    def set_user_password(self, user_id: str, password: str, temporary: bool = False) -> Dict[str, Any]:
        """
        Define senha para um usuário
        """
        if not self.admin_token:
            self.get_admin_token()
            
        url = f"{self.admin_url}/users/{user_id}/reset-password"
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}',
            'Content-Type': 'application/json'
        }
        
        password_data = {
            'type': 'password',
            'value': password,
            'temporary': temporary
        }
        
        try:
            response = requests.put(url, json=password_data, headers=headers, timeout=10)
            
            if response.status_code == 204:
                logger.info(f"Senha definida para usuário: {user_id}")
                return {'success': True}
            else:
                error_msg = f"Erro ao definir senha: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return {'success': False, 'error': error_msg}
                
        except requests.RequestException as e:
            error_msg = f"Erro de conexão ao definir senha: {str(e)}"
            logger.error(error_msg)
            return {'success': False, 'error': error_msg}
    
    def update_user(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Atualiza dados de um usuário existente
        """
        if not self.admin_token:
            self.get_admin_token()
            
        # Primeiro obter dados atuais do usuário
        existing_user = self.get_user_by_id(user_id)
        if not existing_user:
            return {'success': False, 'error': 'Usuário não encontrado'}
        
        # Atualizar apenas os campos fornecidos
        for key, value in user_data.items():
            if key in existing_user and key not in ['id']:
                existing_user[key] = value
        
        url = f"{self.admin_url}/users/{user_id}"
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.put(url, json=existing_user, headers=headers, timeout=10)
            
            if response.status_code == 204:
                logger.info(f"Usuário atualizado com sucesso: {user_id}")
                return {'success': True, 'user_id': user_id}
            else:
                error_msg = f"Erro ao atualizar usuário: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return {'success': False, 'error': error_msg}
        except requests.RequestException as e:
            error_msg = f"Erro de conexão ao atualizar usuário: {str(e)}"
            logger.error(error_msg)
            return {'success': False, 'error': error_msg}
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """
        Busca usuário por username
        """
        if not self.admin_token:
            self.get_admin_token()
            
        url = f"{self.admin_url}/users"
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        params = {'username': username}
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                users = response.json()
                return users[0] if users else None
            else:
                logger.warning(f"Erro ao buscar usuário por username: {response.status_code}")
                return None
        except requests.RequestException as e:
            logger.error(f"Erro de conexão ao buscar usuário: {str(e)}")
            return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Busca usuário por email
        """
        if not self.admin_token:
            self.get_admin_token()
            
        url = f"{self.admin_url}/users"
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        params = {'email': email}
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                users = response.json()
                return users[0] if users else None
            else:
                logger.warning(f"Erro ao buscar usuário por email: {response.status_code}")
                return None
        except requests.RequestException as e:
            logger.error(f"Erro de conexão ao buscar usuário: {str(e)}")
            return None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Busca usuário por ID
        """
        if not self.admin_token:
            self.get_admin_token()
            
        url = f"{self.admin_url}/users/{user_id}"
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Erro ao buscar usuário por ID: {response.status_code}")
                return None
        except requests.RequestException as e:
            logger.error(f"Erro de conexão ao buscar usuário: {str(e)}")
            return None
    
    def delete_user(self, user_id: str) -> Dict[str, Any]:
        """
        Remove um usuário
        """
        if not self.admin_token:
            self.get_admin_token()
            
        url = f"{self.admin_url}/users/{user_id}"
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        try:
            response = requests.delete(url, headers=headers, timeout=10)
            
            if response.status_code == 204:
                logger.info(f"Usuário removido com sucesso: {user_id}")
                return {'success': True}
            else:
                error_msg = f"Erro ao remover usuário: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return {'success': False, 'error': error_msg}
        except requests.RequestException as e:
            error_msg = f"Erro de conexão ao remover usuário: {str(e)}"
            logger.error(error_msg)
            return {'success': False, 'error': error_msg}
    
    def list_users(self, first: int = 0, max: int = 20) -> List[Dict[str, Any]]:
        """
        Lista usuários com paginação
        """
        if not self.admin_token:
            self.get_admin_token()
            
        url = f"{self.admin_url}/users"
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        params = {
            'first': first,
            'max': max
        }
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Erro ao listar usuários: {response.status_code}")
                return []
        except requests.RequestException as e:
            logger.error(f"Erro de conexão ao listar usuários: {str(e)}")
            return []
    
    def get_available_roles(self) -> List[Dict[str, Any]]:
        """
        Obtém as roles disponíveis no realm
        """
        if not self.admin_token:
            self.get_admin_token()
            
        url = f"{self.admin_url}/roles"
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Erro ao obter roles: {response.status_code}")
                return []
        except requests.RequestException as e:
            logger.error(f"Erro de conexão ao obter roles: {str(e)}")
            return []
    
    def get_user_roles(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Obtém as roles atribuídas a um usuário
        """
        if not self.admin_token:
            self.get_admin_token()
            
        url = f"{self.admin_url}/users/{user_id}/role-mappings/realm"
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Erro ao obter roles do usuário: {response.status_code}")
                return []
        except requests.RequestException as e:
            logger.error(f"Erro de conexão ao obter roles do usuário: {str(e)}")
            return []
    
    def assign_role_to_user(self, user_id: str, role_name: str) -> Dict[str, Any]:
        """
        Atribui uma role a um usuário
        """
        if not self.admin_token:
            self.get_admin_token()
            
        # Primeiro, obter a role
        roles_url = f"{self.admin_url}/roles/{role_name}"
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        try:
            role_response = requests.get(roles_url, headers=headers, timeout=10)
            
            if role_response.status_code != 200:
                return {'success': False, 'error': 'Role não encontrada'}
            
            role_data = role_response.json()
            
            # Atribuir role ao usuário
            assign_url = f"{self.admin_url}/users/{user_id}/role-mappings/realm"
            
            role_mapping = [{
                'id': role_data['id'],
                'name': role_data['name']
            }]
            
            headers['Content-Type'] = 'application/json'
            
            assign_response = requests.post(
                assign_url, 
                json=role_mapping, 
                headers=headers,
                timeout=10
            )
            
            if assign_response.status_code == 204:
                logger.info(f"Role {role_name} atribuída ao usuário {user_id}")
                return {'success': True}
            else:
                error_msg = f"Erro ao atribuir role: {assign_response.status_code} - {assign_response.text}"
                logger.error(error_msg)
                return {'success': False, 'error': error_msg}
                
        except requests.RequestException as e:
            error_msg = f"Erro de conexão ao atribuir role: {str(e)}"
            logger.error(error_msg)
            return {'success': False, 'error': error_msg}
    
    def remove_role_from_user(self, user_id: str, role_name: str) -> Dict[str, Any]:
        """
        Remove uma role de um usuário
        """
        if not self.admin_token:
            self.get_admin_token()
            
        # Primeiro, obter a role
        roles_url = f"{self.admin_url}/roles/{role_name}"
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        try:
            role_response = requests.get(roles_url, headers=headers, timeout=10)
            
            if role_response.status_code != 200:
                return {'success': False, 'error': 'Role não encontrada'}
            
            role_data = role_response.json()
            
            # Remover role do usuário
            remove_url = f"{self.admin_url}/users/{user_id}/role-mappings/realm"
            
            role_mapping = [{
                'id': role_data['id'],
                'name': role_data['name']
            }]
            
            headers['Content-Type'] = 'application/json'
            
            remove_response = requests.delete(
                remove_url, 
                json=role_mapping, 
                headers=headers,
                timeout=10
            )
            
            if remove_response.status_code == 204:
                logger.info(f"Role {role_name} removida do usuário {user_id}")
                return {'success': True}
            else:
                error_msg = f"Erro ao remover role: {remove_response.status_code} - {remove_response.text}"
                logger.error(error_msg)
                return {'success': False, 'error': error_msg}
                
        except requests.RequestException as e:
            error_msg = f"Erro de conexão ao remover role: {str(e)}"
            logger.error(error_msg)
            return {'success': False, 'error': error_msg}

# Instância global do gerenciador de usuários Keycloak
keycloak_user_manager = KeycloakUserManager()
