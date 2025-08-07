import os
import requests
from typing import Dict, Any, Optional
import logging
from ..models.auth import User, TokenData

logger = logging.getLogger(__name__)

class KeycloakAuthService:
    """
    Serviço de autenticação usando Keycloak como provedor
    Centraliza toda autenticação e autorização no Keycloak
    """
    
    def __init__(self):
        self.base_url = os.getenv('VITE_KEYCLOAK_URL_BASE')
        self.realm = os.getenv('VITE_KEYCLOAK_REALM')
        self.client_id = os.getenv('VITE_KEYCLOAK_CLIENT_ID') 
        self.client_secret = os.getenv('VITE_KEYCLOAK_CLIENT_SECRET')
        
        # Validar configurações
        if not all([self.base_url, self.realm, self.client_id, self.client_secret]):
            raise ValueError("Configurações do Keycloak incompletas no .env")
        
        # URLs importantes
        self.token_url = f"{self.base_url}/realms/{self.realm}/protocol/openid-connect/token"
        self.userinfo_url = f"{self.base_url}/realms/{self.realm}/protocol/openid-connect/userinfo"
        self.logout_url = f"{self.base_url}/realms/{self.realm}/protocol/openid-connect/logout"
        self.admin_url = f"{self.base_url}/admin/realms/{self.realm}"
    
    async def validate_token(self, token: str) -> Optional[TokenData]:
        """Valida um token de acesso do Keycloak"""
        try:
            headers = {
                'Authorization': f'Bearer {token}'
            }
            
            response = requests.get(self.userinfo_url, headers=headers, timeout=5)
            
            if response.status_code == 200:
                user_data = response.json()
                return TokenData(
                    sub=user_data.get('sub'),
                    email=user_data.get('email'),
                    name=user_data.get('name'),
                    preferred_username=user_data.get('preferred_username'),
                    roles=user_data.get('realm_access', {}).get('roles', [])
                )
            else:
                logger.warning(f"Token validation failed: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error validating token: {str(e)}")
            return None
    
    async def get_user_info(self, token: str) -> Optional[Dict[str, Any]]:
        """Obtém informações do usuário com base no token de acesso"""
        try:
            headers = {
                'Authorization': f'Bearer {token}'
            }
            
            response = requests.get(self.userinfo_url, headers=headers, timeout=5)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Failed to get user info: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting user info: {str(e)}")
            return None

    async def introspect_token(self, token: str) -> Dict[str, Any]:
        """Introspect token para verificar validade e obter claims"""
        try:
            data = {
                'token': token,
                'client_id': self.client_id,
                'client_secret': self.client_secret
            }
            
            introspect_url = f"{self.base_url}/realms/{self.realm}/protocol/openid-connect/token/introspect"
            response = requests.post(introspect_url, data=data, timeout=5)
            
            if response.status_code == 200:
                result = response.json()
                return result
            else:
                logger.warning(f"Token introspection failed: {response.status_code}")
                return {"active": False}
                
        except Exception as e:
            logger.error(f"Error introspecting token: {str(e)}")
            return {"active": False}
    
    def get_admin_token(self) -> Optional[str]:
        """Obtém token de administrador para uso com a API Admin do Keycloak"""
        try:
            data = {
                'grant_type': 'client_credentials',
                'client_id': self.client_id,
                'client_secret': self.client_secret
            }
            
            response = requests.post(self.token_url, data=data, timeout=5)
            
            if response.status_code == 200:
                token_data = response.json()
                return token_data['access_token']
            else:
                logger.error(f"Failed to get admin token: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting admin token: {str(e)}")
            return None

    async def get_current_user(self, token: str) -> Optional[User]:
        """Converte informações do token em um objeto User"""
        user_info = await self.get_user_info(token)
        
        if not user_info:
            return None
        
        return User(
            id=user_info.get('sub', ''),
            email=user_info.get('email', ''),
            username=user_info.get('preferred_username', ''),
            firstName=user_info.get('given_name', ''),
            lastName=user_info.get('family_name', ''),
            roles=user_info.get('realm_access', {}).get('roles', [])
        )

# Instância global do serviço de autenticação Keycloak
keycloak_auth_service = KeycloakAuthService()
