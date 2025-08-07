import os
import requests
from typing import Dict, Any, Optional
import logging

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
        
        # Validar configurações
        if not all([self.base_url, self.realm, self.client_id, self.client_secret]):
            raise ValueError("Configurações do Keycloak incompletas no .env")
    
    def get_admin_token(self) -> str:
        """
        Obtém token de administrador para usar a API Admin do Keycloak
        """
        # Para Keycloak v26+, usar o endpoint master realm para admin
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
            
        url = f"{self.base_url}/admin/realms/{self.realm}/users"
        
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
            
        url = f"{self.base_url}/admin/realms/{self.realm}/users/{user_id}/reset-password"
        
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
            
        url = f"{self.base_url}/admin/realms/{self.realm}/users/{user_id}"
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.put(url, json=user_data, headers=headers)
        
        if response.status_code == 204:
            return {'success': True}
        else:
            return {'success': False, 'error': response.text}
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """
        Busca usuário por username
        """
        if not self.admin_token:
            self.get_admin_token()
            
        url = f"{self.base_url}/admin/realms/{self.realm}/users"
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        params = {'username': username}
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            users = response.json()
            return users[0] if users else None
        else:
            return None
    
    def assign_role_to_user(self, user_id: str, role_name: str) -> Dict[str, Any]:
        """
        Atribui uma role a um usuário
        """
        if not self.admin_token:
            self.get_admin_token()
            
        # Primeiro, obter a role
        roles_url = f"{self.base_url}/admin/realms/{self.realm}/roles/{role_name}"
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        role_response = requests.get(roles_url, headers=headers)
        if role_response.status_code != 200:
            return {'success': False, 'error': 'Role não encontrada'}
        
        role_data = role_response.json()
        
        # Atribuir role ao usuário
        assign_url = f"{self.base_url}/admin/realms/{self.realm}/users/{user_id}/role-mappings/realm"
        
        role_mapping = [{
            'id': role_data['id'],
            'name': role_data['name']
        }]
        
        assign_response = requests.post(assign_url, json=role_mapping, headers=headers)
        
        if assign_response.status_code == 204:
            return {'success': True}
        else:
            return {'success': False, 'error': assign_response.text}

# Exemplo de uso:
if __name__ == "__main__":
    manager = KeycloakUserManager()
    
    # Criar novo usuário
    new_user = {
        'username': 'novo_usuario',
        'email': 'novo@convflow.com',
        'firstName': 'Novo',
        'lastName': 'Usuário',
        'password': 'senha123',
        'emailVerified': True,
        'enabled': True
    }
    
    result = manager.create_user(new_user)
    print(f"Resultado: {result}")
    
    if result['success']:
        # Atribuir role de admin
        role_result = manager.assign_role_to_user(result['user_id'], 'admin')
        print(f"Role atribuída: {role_result}")
