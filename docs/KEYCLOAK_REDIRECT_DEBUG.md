# Correção dos Problemas de Redirecionamento e Estado de Login no Keycloak

## Problemas Identificados

Foram identificados os seguintes problemas na integração do Keycloak:

1. **Redirecionamento inconsistente**: Após autenticação no Keycloak, o usuário estava sendo redirecionado de volta para a página de login, mesmo estando autenticado.

2. **Estado de autenticação não persistente**: A aplicação não estava mantendo o estado de autenticação corretamente entre páginas.

3. **Logout sem redirecionamento**: Ao fazer logout, não havia redirecionamento configurado.

## Alterações Realizadas

### 1. Melhorias no Serviço Keycloak (keycloakService.ts)

- **Adicionado redirecionamento específico nas opções de inicialização**:
  ```typescript
  const initOptions = {
    // outras opções...
    redirectUri: window.location.origin + '/dashboard', // Redirecionar para o dashboard após autenticação
  };
  ```

- **Melhorado o método isAuthenticated() para armazenar o estado**:
  ```typescript
  isAuthenticated(): boolean {
    const authenticated = keycloak.authenticated || false;
    
    // Armazenar estado de autenticação para verificações entre páginas
    if (authenticated) {
      sessionStorage.setItem('keycloak-authenticated', 'true');
    }
    
    return authenticated;
  }
  ```

- **Configurado redirecionamento após logout**:
  ```typescript
  async logout(): Promise<void> {
    // outras linhas...
    return keycloak.logout({
      redirectUri: window.location.origin
    });
  }
  ```

- **Adicionado listener de eventos para o callback do Keycloak**:
  ```typescript
  window.addEventListener('keycloak-callback', () => {
    console.log('Keycloak callback event received');
  });
  ```

### 2. Adicionado Script de Verificação de Autenticação (auth-check.js)

Foi criado um script que é carregado em todas as páginas e que:

1. Detecta quando há um código de autorização na URL (redirecionamento do Keycloak)
2. Dispara um evento personalizado para informar o KeycloakService
3. Redireciona para o dashboard se o usuário já estiver autenticado mas estiver na página de login

```javascript
window.onload = function() {
  // Verificar se estamos em uma URL de callback
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
  
  const code = urlParams.get('code') || hashParams.get('code');
  
  if (code) {
    // Disparar evento para KeycloakService
    const callbackEvent = new Event('keycloak-callback');
    window.dispatchEvent(callbackEvent);
    
    // Salvar informação para depuração
    sessionStorage.setItem('keycloak-callback-detected', 'true');
  }
  
  // Redirecionar se necessário
  const authenticated = sessionStorage.getItem('keycloak-authenticated');
  if (authenticated === 'true' && window.location.pathname === '/login') {
    window.location.href = '/dashboard';
  }
};
```

### 3. Melhorias no Componente ProtectedRoute

Adicionado log para depuração e gerenciamento do estado de autenticação:

```typescript
if (!isAuthenticated || !user) {
  console.log('ProtectedRoute: Unauthorized access attempt, redirecting to login');
  // Remover estado de autenticação para forçar reautenticação
  sessionStorage.removeItem('keycloak-authenticated');
  return <Navigate to="/login" replace />;
}

console.log('ProtectedRoute: User authenticated, granting access', user?.username);
```

## Como Verificar as Alterações

1. Reinicie a aplicação frontend para aplicar todas as alterações
2. Limpe o cache do navegador e os cookies relacionados ao Keycloak
3. Tente fazer login novamente
4. Verifique o console do navegador para ver as mensagens de log adicionadas
5. Confirme que após o login, você é redirecionado para o dashboard
6. Verifique que o header mostra corretamente seu nome de usuário e o menu de usuário

## Observações Adicionais

- Foi adicionado o script auth-check.js ao index.html para carregamento em todas as páginas
- O sistema agora usa sessionStorage para ajudar a manter o estado de autenticação entre páginas
- Foram adicionados logs detalhados para facilitar a depuração do processo de autenticação
