# ConvFlow - Configuração e Solução de Problemas do Keycloak

## 🔧 Problemas Identificados e Soluções

### 1. ❌ Problema: Redirecionamento Automático Infinito
**Sintoma**: A aplicação fica fazendo login automaticamente em loop
**Causa**: O contexto estava forçando login automático sempre que o usuário não estava autenticado
**✅ Solução**: Removido o redirecionamento automático do `KeycloakAuthContext.tsx`

### 2. ❌ Problema: Usuário 'test' não existe
**Sintoma**: Não consegue fazer login com test/123456
**Causa**: Usuário não foi criado no Keycloak
**✅ Solução**: Execute o script para criar o usuário

## 🚀 Como Configurar

### Configurações Atuais (CORRETAS)
```env
VITE_KEYCLOAK_URL=https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net
VITE_KEYCLOAK_REALM=convflow
VITE_KEYCLOAK_CLIENT_ID=qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8
```

### Passo 1: Criar Usuário de Teste

#### No Windows (PowerShell):
```powershell
.\create-test-user.ps1
```

#### No Linux/Mac:
```bash
chmod +x create-test-user.sh
./create-test-user.sh
```

### Passo 2: Verificar Configuração

#### Executar Diagnóstico:
```bash
chmod +x diagnose-keycloak.sh
./diagnose-keycloak.sh
```

### Passo 3: Testar o Frontend

1. **Iniciar o frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Acessar:** http://localhost:5173

3. **Login:**
   - Clique em "Sign in with Keycloak"
   - Username: `test`
   - Password: `123456`

## 🔍 Verificações de Funcionamento

### ✅ Keycloak Acessível
```bash
curl https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net/realms/convflow/.well-known/openid_configuration
```

### ✅ Usuário Test Existe
Deve retornar dados do usuário quando executado com credenciais de admin.

### ✅ Cliente Configurado
O cliente `qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8` deve estar habilitado e com URLs de redirect corretas.

## 🐛 Debugging

### Logs do Navegador
1. Abra F12 → Console
2. Verifique logs do Keycloak durante o login
3. Procure por erros de CORS ou configuração

### Configurações do Cliente Keycloak
Verifique no Admin Console do Keycloak:
- **Valid Redirect URIs**: `http://localhost:5173/*`
- **Web Origins**: `http://localhost:5173`
- **Access Type**: public
- **Standard Flow Enabled**: ON
- **Direct Access Grants Enabled**: ON

## 📋 Checklist de Funcionamento

- [ ] Keycloak acessível
- [ ] Realm 'convflow' existe
- [ ] Cliente configurado corretamente
- [ ] Usuário 'test' criado com senha '123456'
- [ ] Usuário 'test' tem role 'admin'
- [ ] Frontend conecta sem erros
- [ ] Login manual funciona (não automático)
- [ ] Redirecionamento após login funciona
- [ ] Token é válido e contém informações do usuário

## 🔧 Comandos Úteis

### Criar usuário de teste:
```bash
# Windows
.\create-test-user.ps1

# Linux/Mac
./create-test-user.sh
```

### Diagnóstico completo:
```bash
./diagnose-keycloak.sh
```

### Verificar logs do frontend:
```bash
cd frontend
npm run dev
# Abrir http://localhost:5173 e verificar Console (F12)
```

## 🆘 Solução de Problemas Comuns

### "Failed to initialize Keycloak"
- Verifique conectividade com o servidor
- Confirme URLs no .env
- Verifique se o realm existe

### "User not found" no login
- Execute `create-test-user.ps1` ou `create-test-user.sh`
- Verifique se o usuário foi criado no Admin Console

### Redirecionamento infinito
- ✅ Já corrigido - removido login automático
- Verifique URLs de redirect no cliente

### CORS errors
- Verifique "Web Origins" no cliente Keycloak
- Confirme se inclui `http://localhost:5173`

## 📞 Contato
Se os problemas persistirem, forneça:
1. Logs do console do navegador
2. Resultado do `diagnose-keycloak.sh`
3. Capturas de tela dos erros
