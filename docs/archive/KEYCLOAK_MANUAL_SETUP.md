# 🔧 ConvFlow - Configuração Manual do Keycloak

## ⚠️ PROBLEMA IDENTIFICADO
O realm `convflow` não existe no servidor Keycloak. É necessário criar manualmente.

## 🎯 SOLUÇÃO: Configuração Manual

### Passo 1: Acessar o Admin Console
1. **Acesse:** https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net/admin
2. **Faça login** com as credenciais de administrador

### Passo 2: Criar o Realm 'convflow'
1. **No Admin Console**, clique em "Add realm" ou "Create realm"
2. **Nome do realm:** `convflow`
3. **Display name:** `ConvFlow`
4. **Habilitar:** ✅ Enabled
5. **Clique em "Create"**

### Passo 3: Configurar o Cliente
1. **Vá para:** Clients → Create
2. **Client ID:** `qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8`
3. **Name:** `ConvFlow App`
4. **Root URL:** `http://localhost:5173`
5. **Configurações importantes:**
   - ✅ **Enabled:** ON
   - ✅ **Client Protocol:** openid-connect
   - ✅ **Access Type:** public
   - ✅ **Standard Flow Enabled:** ON
   - ✅ **Direct Access Grants Enabled:** ON
   - ❌ **Service Accounts Enabled:** OFF

6. **Valid Redirect URIs:**
   ```
   http://localhost:5173/*
   http://localhost:3000/*
   https://localhost:5173/*
   ```

7. **Web Origins:**
   ```
   http://localhost:5173
   http://localhost:3000
   ```

### Passo 4: Criar Roles
1. **Vá para:** Roles → Add Role
2. **Criar role "admin":**
   - **Role Name:** `admin`
   - **Description:** `Administrator role`
3. **Criar role "user":**
   - **Role Name:** `user`
   - **Description:** `Regular user role`

### Passo 5: Criar o Usuário 'test'
1. **Vá para:** Users → Add user
2. **Configurações do usuário:**
   - **Username:** `test`
   - **Email:** `test@convflow.com`
   - **First Name:** `Test`
   - **Last Name:** `User`
   - ✅ **Email Verified:** ON
   - ✅ **Enabled:** ON

3. **Definir senha:**
   - **Vá para:** Credentials → Set Password
   - **Password:** `123456`
   - **Confirm Password:** `123456`
   - ❌ **Temporary:** OFF

4. **Atribuir roles:**
   - **Vá para:** Role Mappings
   - **Available Roles:** Selecione `admin` e `user`
   - **Clique em "Add selected"**

## 🧪 Teste da Configuração

### Teste 1: Verificar Realm
```powershell
curl "https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net/realms/convflow/.well-known/openid_configuration"
```
**Resultado esperado:** JSON com configurações do realm

### Teste 2: Testar Login
```powershell
$body = @{
    username = "test"
    password = "123456"
    grant_type = "password"
    client_id = "qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8"
}

$response = Invoke-RestMethod -Uri "https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net/realms/convflow/protocol/openid-connect/token" -Method Post -Body $body

$response.access_token
```
**Resultado esperado:** Token de acesso válido

## 🚀 Após a Configuração Manual

### 1. Testar o Frontend
```bash
cd frontend
npm run dev
```

### 2. Acessar e Testar
- **URL:** http://localhost:5173
- **Clique em:** "Sign in with Keycloak"
- **Login:** test / 123456

## 📋 Checklist de Configuração

- [ ] Realm 'convflow' criado
- [ ] Cliente configurado com ID correto
- [ ] Redirect URIs configuradas
- [ ] Web Origins configuradas
- [ ] Roles 'admin' e 'user' criadas
- [ ] Usuário 'test' criado
- [ ] Senha definida como '123456'
- [ ] Roles atribuídas ao usuário
- [ ] Teste de conectividade bem-sucedido
- [ ] Teste de login bem-sucedido
- [ ] Frontend conecta e faz login

## 🔧 Configurações do Frontend (Verificar .env)

```env
VITE_KEYCLOAK_URL=https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net
VITE_KEYCLOAK_REALM=convflow
VITE_KEYCLOAK_CLIENT_ID=qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8
```

## 🎯 RESUMO

**PROBLEMA:** Realm 'convflow' não existe  
**SOLUÇÃO:** Configuração manual no Admin Console  
**RESULTADO:** Login automático funcional com usuário test/123456  

Após seguir estes passos, a implementação do Keycloak estará correta e funcionando adequadamente.
