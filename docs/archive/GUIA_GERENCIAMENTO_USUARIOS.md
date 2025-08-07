# 🔐 GUIA COMPLETO DE GERENCIAMENTO DE USUÁRIOS - KEYCLOAK

## ✅ **Sim, todo login agora é pelo Keycloak!**

### 🎯 **O que está centralizado:**
- ✅ Login/Logout
- ✅ Autenticação JWT
- ✅ Controle de sessões
- ✅ Roles e permissões
- ✅ Validação de tokens

---

## 👥 **3 FORMAS DE GERENCIAR USUÁRIOS:**

### **1. 🖥️ Admin Console (MAIS FÁCIL)**
**URL:** `https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net/admin`

**Para criar usuários:**
- Login como admin → Users → Create new user
- Preencher dados, definir senha
- Atribuir roles (admin, user, etc.)

**Para editar usuários:**
- Users → Buscar → Editar dados
- Alterar senha, roles, ativar/desativar

---

### **2. 🔓 Autoregistro (USUÁRIOS SE CADASTRAM)**

**Como configurar:**
```bash
# Execute o script de configuração:
.\configurar-autoregistro.ps1
```

**O que habilitar no Admin Console:**
- Realm Settings → Login → User registration ✅
- Configurar email SMTP para confirmação
- Link "Register" aparecerá na tela de login

**Resultado:**
- Usuários se cadastram em: `/realms/convflow/protocol/openid-connect/registrations`
- Recebem email de confirmação
- Você aprova/gerencia via Admin Console

---

### **3. 🔧 API Programática (MAIS AVANÇADA)**

**Já implementei endpoints na sua API:**

#### **Criar usuário via API:**
```bash
POST /api/users/create
{
  "username": "novo_usuario",
  "email": "novo@convflow.com", 
  "firstName": "Nome",
  "lastName": "Sobrenome",
  "password": "senha123"
}
```

#### **Buscar usuário:**
```bash
GET /api/users/search/{username}
```

#### **Atualizar usuário:**
```bash
PUT /api/users/update/{user_id}
{
  "firstName": "Novo Nome",
  "email": "novoemail@convflow.com"
}
```

#### **Atribuir roles:**
```bash
POST /api/users/assign-role/{user_id}/admin
```

---

## 🛠️ **CONFIGURAÇÕES RECOMENDADAS:**

### **Para produção, configure:**

1. **Email SMTP** (confirmação de cadastro)
2. **Policies de senha** (força, expiração)
3. **Two-Factor Authentication** (2FA)
4. **Roles customizadas** (admin, moderador, premium, etc.)
5. **Themes customizados** (visual da sua marca)

---

## 🚀 **PRÓXIMOS PASSOS:**

### **Opção A - Usar Admin Console (Simples):**
1. Acesse o Admin Console
2. Crie usuários manualmente conforme necessário
3. Gerencie roles e permissões

### **Opção B - Habilitar autoregistro:**
1. Execute: `.\configurar-autoregistro.ps1`
2. Configure email SMTP
3. Usuários se cadastram sozinhos

### **Opção C - Usar API (Integrado):**
1. Use os endpoints que criei: `/api/users/*`
2. Integre com seu frontend
3. Controle total programático

---

## 📋 **CREDENCIAIS ATUAIS:**
- **Admin Console:** Suas credenciais de admin do Keycloak
- **Usuário teste:** `test` / `123456`
- **Client ID:** `cvclient`

---

## ❓ **QUAL OPÇÃO VOCÊ PREFERE?**

**Para começar rápido:** Use o Admin Console
**Para usuários se cadastrarem:** Configure autoregistro  
**Para controle total:** Use a API programática

**Posso ajudar a implementar qualquer uma dessas opções! 🚀**
