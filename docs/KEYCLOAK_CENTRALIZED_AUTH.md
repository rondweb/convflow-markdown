# Autenticação Centralizada com Keycloak - ConvFlow

## Visão Geral

A ConvFlow utiliza o Keycloak como provedor centralizado de autenticação e autorização. Este documento explica a integração e como utilizar os recursos de autenticação e gerenciamento de usuários.

## 1. Configuração

### Variáveis de Ambiente

As seguintes variáveis de ambiente são utilizadas para configuração do Keycloak:

```
# Keycloak Authentication Configuration
VITE_KEYCLOAK_URL_BASE=https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net
VITE_KEYCLOAK_URL_TOKEN=https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net/realms/convflow/protocol/openid-connect/token
VITE_KEYCLOAK_URL_USER_INFO=https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net/realms/convflow/protocol/openid-connect/userinfo
VITE_KEYCLOAK_URL_LOGOUT=https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net/realms/convflow/protocol/openid-connect/logout
VITE_KEYCLOAK_REALM=convflow
VITE_KEYCLOAK_CLIENT_ID=cvclient
VITE_KEYCLOAK_CLIENT_SECRET=EaAMfY2er4Bg3qfs9TmRyVuehAcIWgcf
```

## 2. Autenticação

O sistema utiliza o protocolo OAuth 2.0 e OpenID Connect implementado pelo Keycloak para autenticação.

### Frontend (React)

O frontend utiliza o contexto `KeycloakAuthContext` para gerenciar a autenticação:

```typescript
import { useKeycloakAuth } from '../contexts/KeycloakAuthContext';

// No componente
const { login, logout, user, isAuthenticated, hasRole } = useKeycloakAuth();

// Login
const handleLogin = async () => {
  await login();
};

// Logout
const handleLogout = async () => {
  await logout();
};

// Verificar autenticação
if (isAuthenticated) {
  console.log('Usuário autenticado:', user);
}

// Verificar permissão
if (hasRole('admin')) {
  console.log('Usuário é administrador');
}
```

### Backend (FastAPI)

O backend utiliza dependency injection para proteger rotas:

```python
from fastapi import Depends
from src.routes.auth_keycloak import get_current_user, User

@router.get("/protected-route")
async def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": "Authenticated", "user_id": current_user.id}
```

## 3. Gerenciamento de Usuários

A API fornece endpoints para gerenciar usuários no Keycloak.

### Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/users/create` | Cria novo usuário |
| GET | `/api/users/list` | Lista usuários |
| GET | `/api/users/search` | Busca usuário por username ou email |
| GET | `/api/users/{user_id}` | Obtém dados de um usuário |
| PUT | `/api/users/update/{user_id}` | Atualiza dados de usuário |
| DELETE | `/api/users/delete/{user_id}` | Remove usuário |
| POST | `/api/users/assign-role/{user_id}/{role_name}` | Atribui role a usuário |
| DELETE | `/api/users/remove-role/{user_id}/{role_name}` | Remove role de usuário |
| GET | `/api/users/roles/list` | Lista roles disponíveis |

### Exemplos de Uso

#### Criar Usuário

```javascript
const createUser = async () => {
  const response = await fetch('/api/users/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'novousuario',
      email: 'novo@exemplo.com',
      firstName: 'Novo',
      lastName: 'Usuário',
      password: 'senha123',
      roles: ['user']
    })
  });
  
  return await response.json();
};
```

#### Listar Usuários

```javascript
const listUsers = async () => {
  const response = await fetch('/api/users/list', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

## 4. Recuperação de Senha

A recuperação de senha é gerenciada pelo Keycloak. O fluxo padrão inclui:

1. Usuário acessa página de login
2. Clica em "Esqueci minha senha"
3. Keycloak envia email com link para redefinição
4. Usuário define nova senha

## 5. Roles e Permissões

O sistema utiliza roles do Keycloak para controle de acesso:

- `user`: Usuário básico
- `admin`: Administrador com acesso completo
- `editor`: Editor com permissões para gerenciar conteúdo

Para verificar roles no frontend:

```typescript
if (hasRole('admin')) {
  // Mostrar funcionalidades de admin
}
```

Para verificar roles no backend:

```python
from src.routes.auth_keycloak import get_admin_user

@router.delete("/api/resources/{id}")
async def delete_resource(id: str, admin_user: User = Depends(get_admin_user)):
    # Apenas admins chegam aqui
    return {"deleted": True}
```

## 6. Migração para Autenticação Centralizada

Para migrar para a nova implementação de autenticação centralizada, execute:

```bash
# Windows
scripts\migrate_to_keycloak_unified.bat

# Linux
./scripts/migrate_to_keycloak_unified.sh
```

Este script faz:

1. Backup dos arquivos originais
2. Substituição pelos novos arquivos centralizados
3. Limpeza de caches
4. Reinicialização dos serviços

## 7. Informações Adicionais

- Token JWT: Expira em 60 minutos
- Refresh Token: Expira em 30 dias
- Cors: Configurado para `localhost:5173` e `localhost:3000`
- Admin API: Necessita de cliente com permissões de realm-admin

## 8. Troubleshooting

### Problemas Comuns

- **Erro 401 Unauthorized**: Verificar validade do token
- **Erro 403 Forbidden**: Verificar se o usuário tem a role necessária
- **Erro de CORS**: Verificar configuração de CORS no Keycloak
- **Token inválido**: Verificar configuração do cliente no Keycloak
