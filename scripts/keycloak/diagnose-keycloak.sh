#!/bin/bash

echo "========================================"
echo "    ConvFlow - Diagnóstico Keycloak"
echo "========================================"
echo ""

KEYCLOAK_URL="https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net"
REALM="convflow"
CLIENT_ID="qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8"

echo "🔍 Verificando configurações do Keycloak..."
echo "   URL: $KEYCLOAK_URL"
echo "   Realm: $REALM"
echo "   Client ID: $CLIENT_ID"
echo ""

# 1. Verificar conectividade geral
echo "1️⃣ Testando conectividade geral..."
if curl -s --max-time 10 "$KEYCLOAK_URL" >/dev/null; then
    echo "   ✅ Keycloak está acessível"
else
    echo "   ❌ Erro: Keycloak não está acessível"
    exit 1
fi

# 2. Verificar realm
echo "2️⃣ Verificando realm '$REALM'..."
REALM_RESPONSE=$(curl -s --max-time 10 "$KEYCLOAK_URL/realms/$REALM/.well-known/openid_configuration")
if [ $? -eq 0 ] && [ "$REALM_RESPONSE" != "" ]; then
    echo "   ✅ Realm '$REALM' existe e está acessível"
    
    # Extrair endpoints importantes
    TOKEN_ENDPOINT=$(echo $REALM_RESPONSE | jq -r .token_endpoint)
    AUTH_ENDPOINT=$(echo $REALM_RESPONSE | jq -r .authorization_endpoint)
    
    echo "   📍 Authorization endpoint: $AUTH_ENDPOINT"
    echo "   📍 Token endpoint: $TOKEN_ENDPOINT"
else
    echo "   ❌ Erro: Realm '$REALM' não encontrado ou inacessível"
    exit 1
fi

# 3. Verificar configuração do cliente (requer credenciais admin)
echo "3️⃣ Para verificar o cliente, precisamos de credenciais de admin..."
read -p "   Admin Username (ou Enter para pular): " ADMIN_USER

if [ ! -z "$ADMIN_USER" ]; then
    read -s -p "   Admin Password: " ADMIN_PASS
    echo ""
    
    # Obter token de admin
    TOKEN_RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=$ADMIN_USER" \
        -d "password=$ADMIN_PASS" \
        -d "grant_type=password" \
        -d "client_id=admin-cli")
    
    TOKEN=$(echo $TOKEN_RESPONSE | jq -r .access_token 2>/dev/null)
    
    if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
        echo "   ✅ Token de admin obtido"
        
        # Verificar cliente
        CLIENT_RESPONSE=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=$CLIENT_ID" \
            -H "Authorization: Bearer $TOKEN")
        
        if [ "$CLIENT_RESPONSE" != "[]" ] && [ "$CLIENT_RESPONSE" != "" ]; then
            echo "   ✅ Cliente '$CLIENT_ID' encontrado"
            
            CLIENT_DATA=$(echo $CLIENT_RESPONSE | jq '.[0]')
            ENABLED=$(echo $CLIENT_DATA | jq -r .enabled)
            PUBLIC=$(echo $CLIENT_DATA | jq -r .publicClient)
            REDIRECT_URIS=$(echo $CLIENT_DATA | jq -r '.redirectUris[]' 2>/dev/null)
            
            echo "   📋 Enabled: $ENABLED"
            echo "   📋 Public Client: $PUBLIC"
            echo "   📋 Redirect URIs:"
            if [ ! -z "$REDIRECT_URIS" ]; then
                echo "$REDIRECT_URIS" | while read uri; do
                    echo "      - $uri"
                done
            else
                echo "      ⚠️  Nenhuma URI configurada"
            fi
            
            # Verificar usuário test
            echo ""
            echo "4️⃣ Verificando usuário 'test'..."
            USER_RESPONSE=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/users?username=test" \
                -H "Authorization: Bearer $TOKEN")
            
            if [ "$USER_RESPONSE" != "[]" ] && [ "$USER_RESPONSE" != "" ]; then
                echo "   ✅ Usuário 'test' encontrado"
                
                USER_DATA=$(echo $USER_RESPONSE | jq '.[0]')
                USER_ENABLED=$(echo $USER_DATA | jq -r .enabled)
                USER_EMAIL=$(echo $USER_DATA | jq -r .email)
                USER_EMAIL_VERIFIED=$(echo $USER_DATA | jq -r .emailVerified)
                
                echo "   📋 Enabled: $USER_ENABLED"
                echo "   📋 Email: $USER_EMAIL"
                echo "   📋 Email Verified: $USER_EMAIL_VERIFIED"
            else
                echo "   ❌ Usuário 'test' não encontrado"
                echo "   💡 Execute: ./create-test-user.sh para criar"
            fi
        else
            echo "   ❌ Cliente '$CLIENT_ID' não encontrado"
        fi
    else
        echo "   ❌ Erro ao obter token de admin"
    fi
else
    echo "   ⏭️  Verificação do cliente pulada"
fi

echo ""
echo "5️⃣ Testando autenticação com credenciais test..."
read -p "   Testar login com test/123456? (y/n): " TEST_LOGIN

if [ "$TEST_LOGIN" = "y" ] || [ "$TEST_LOGIN" = "Y" ]; then
    LOGIN_RESPONSE=$(curl -s -X POST "$TOKEN_ENDPOINT" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=test" \
        -d "password=123456" \
        -d "grant_type=password" \
        -d "client_id=$CLIENT_ID")
    
    LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | jq -r .access_token 2>/dev/null)
    
    if [ "$LOGIN_TOKEN" != "null" ] && [ ! -z "$LOGIN_TOKEN" ]; then
        echo "   ✅ Login bem-sucedido!"
        echo "   📋 Token: ${LOGIN_TOKEN:0:50}..."
        
        # Verificar informações do usuário
        USER_INFO=$(echo $LOGIN_RESPONSE | jq -r .access_token | cut -d'.' -f2 | base64 -d 2>/dev/null | jq 2>/dev/null)
        if [ "$USER_INFO" != "" ]; then
            echo "   📋 Username: $(echo $USER_INFO | jq -r .preferred_username)"
            echo "   📋 Email: $(echo $USER_INFO | jq -r .email)"
            echo "   📋 Roles: $(echo $USER_INFO | jq -r '.realm_access.roles[]' 2>/dev/null | tr '\n' ',' | sed 's/,$//')"
        fi
    else
        echo "   ❌ Falha no login"
        echo "   📋 Resposta: $LOGIN_RESPONSE"
    fi
fi

echo ""
echo "========================================"
echo "    Diagnóstico Completo!"
echo "========================================"
echo ""
echo "📝 Resumo das configurações do frontend:"
echo "   VITE_KEYCLOAK_URL=$KEYCLOAK_URL"
echo "   VITE_KEYCLOAK_REALM=$REALM"
echo "   VITE_KEYCLOAK_CLIENT_ID=$CLIENT_ID"
echo ""
echo "▶️  Para testar no frontend:"
echo "   1. cd frontend"
echo "   2. npm run dev"
echo "   3. Acesse http://localhost:5173"
echo "   4. Clique em 'Sign in with Keycloak'"
echo "   5. Use: test / 123456"
echo ""
