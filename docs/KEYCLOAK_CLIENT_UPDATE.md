# Atualização da Configuração do Keycloak

## Problema Resolvido

Foi identificado um problema na autenticação com o Keycloak onde o sistema estava redirecionando com um client_id incorreto:

```
client_id=qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8
```

Isso estava acontecendo porque havia uma inconsistência nas configurações entre o backend e o frontend:

1. O backend estava configurado para usar o client_id `cvclient` (conforme definido no `.env` principal)
2. O frontend estava configurado para usar o client_id `qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8` (no arquivo `.env.local` do frontend)

## Mudanças Realizadas

### 1. Atualizado o client_id no frontend

O arquivo `.env.local` do frontend foi atualizado para usar o mesmo client_id do backend:

```properties
# Antes
VITE_KEYCLOAK_CLIENT_ID=qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8

# Depois
VITE_KEYCLOAK_CLIENT_ID=cvclient
```

### 2. Corrigido o nome da variável de ambiente

Também foi corrigido o nome da variável de ambiente para o URL do Keycloak no frontend para corresponder ao que é esperado pelo código:

```properties
# Antes
VITE_KEYCLOAK_URL=https://...

# Depois
VITE_KEYCLOAK_URL_BASE=https://...
```

## Configuração do Cliente Keycloak

Se você ainda estiver enfrentando problemas, verifique se o cliente Keycloak `cvclient` está configurado corretamente no servidor Keycloak com as seguintes configurações:

1. **Access Type**: `public` (para aplicações frontend)
2. **Valid Redirect URIs**:
   - `http://localhost:5173/*` (para desenvolvimento local)
   - `https://seusite.com/*` (para produção)
3. **Web Origins**:
   - `+` (para permitir todas as origens configuradas em Valid Redirect URIs)

## Como Verificar se a Configuração está Funcionando

1. Limpe o cache do navegador
2. Reinicie a aplicação frontend
3. Tente fazer login novamente

Se você acessar as ferramentas de desenvolvedor do navegador, deverá ver o correto client_id (`cvclient`) sendo usado na URL de redirecionamento para o Keycloak.
