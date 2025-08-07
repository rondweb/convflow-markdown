# Correção do Redirecionamento do Keycloak

## Problema

Após fazer login no Keycloak, o redirecionamento de volta para a aplicação não estava funcionando corretamente. O usuário era autenticado com sucesso no Keycloak, mas ao retornar para a aplicação, ocorriam problemas.

## Análise

Foram encontrados os seguintes problemas:

1. **Configurações inconsistentes**: Havia inconsistências entre as variáveis de ambiente usadas no arquivo `.env` e `.env.local` do frontend
   - No `.env.local` estava sendo usada a variável `VITE_KEYCLOAK_URL` enquanto o código esperava `VITE_KEYCLOAK_URL_BASE`
   - Havia também uma inconsistência no `client_id` que já foi corrigida anteriormente

2. **Redirecionamento**: No `keycloakService.ts`, o código para redirecionamento após login/registro poderia ser aprimorado para garantir a formatação correta da URL

3. **Componente de Debug**: O componente `KeycloakDebug.tsx` estava referenciando a variável de ambiente incorreta (`VITE_KEYCLOAK_URL` em vez de `VITE_KEYCLOAK_URL_BASE`)

## Soluções Implementadas

### 1. Melhoria no redirecionamento em keycloakService.ts

Foi adicionado log para depuração e aprimorada a formatação da URL de redirecionamento:

```typescript
// Login do usuário
async login(): Promise<void> {
  if (!this.initialized) {
    throw new Error('Keycloak not initialized');
  }
  console.log('Attempting to login...');
  
  // Usar redirecionamento em vez de popup para melhor compatibilidade
  console.log('Current location.origin:', window.location.origin);
  
  // Ajustado para usar location.origin corretamente
  return keycloak.login({
    redirectUri: `${window.location.origin}/dashboard`
  });
}
```

A mesma melhoria foi aplicada ao método `register()`.

### 2. Correção do Componente KeycloakDebug

O componente de depuração foi atualizado para usar a variável de ambiente correta:

```typescript
<div>Keycloak URL: {import.meta.env.VITE_KEYCLOAK_URL_BASE}</div>
```

### 3. Adição de Script de Callback para Depuração

Foi criado um arquivo `keycloak-callback.js` no diretório `public` para ajudar a diagnosticar problemas no processo de redirecionamento do Keycloak:

```javascript
window.onload = function() {
  console.log('Handling Keycloak callback...');
  
  // Obter fragmentos da URL (que podem conter o token)
  const fragment = window.location.hash.substring(1);
  const params = new URLSearchParams(fragment);
  
  // Verificar se temos código de autorização ou erro
  const code = params.get('code');
  const error = params.get('error');
  const state = params.get('state');
  
  console.log('Authorization code received:', code ? 'Yes' : 'No');
  console.log('State token:', state);
  
  if (error) {
    console.error('Authentication error:', error);
    const errorDescription = params.get('error_description');
    alert(`Authentication failed: ${errorDescription || error}`);
  }
  
  console.log('Keycloak callback handler loaded successfully');
};
```

## Verificação do Cliente Keycloak

Certifique-se também de que o cliente Keycloak `cvclient` esteja configurado corretamente no servidor Keycloak:

1. **URLs de Redirecionamento Válidas**:
   - Deve incluir `http://localhost:5173/*` para desenvolvimento
   - Deve incluir a URL de produção da aplicação

2. **Configuração de Web Origins**:
   - Deve estar configurado com `+` ou incluir explicitamente as origens permitidas

3. **Configuração de CORS**:
   - Verifique se o CORS está habilitado no servidor Keycloak

## Como verificar o sucesso

1. Limpe o cache do navegador
2. Reinicie a aplicação frontend
3. Tente fazer login novamente
4. Verifique o console do navegador para mensagens de log detalhadas
5. O redirecionamento após login/registro deve levar para a página `/dashboard` corretamente

Se ainda houver problemas, verifique:
1. Se o token está sendo recebido corretamente após o redirecionamento
2. Se o serviço Keycloak consegue validar o token recebido
3. Se há erros CORS no console do navegador
