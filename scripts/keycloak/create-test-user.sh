#!/bin/bash

echo "========================================"
echo "    ConvFlow - Criando Usuário Test"
echo "========================================"
echo ""

KEYCLOAK_URL="https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net"
REALM="convflow"

echo "🔐 Conectando ao Keycloak em: $KEYCLOAK_URL"

# Verificar se o Keycloak está acessível
if ! curl -s --max-time 10 "$KEYCLOAK_URL/realms/$REALM/.well-known/openid_configuration" >/dev/null; then
    echo "❌ Erro: Não foi possível conectar ao Keycloak"
    echo "   Verifique se o Keycloak está rodando em: $KEYCLOAK_URL"
    echo "   Verifique se o realm '$REALM' existe"
    exit 1
fi

echo "✅ Keycloak acessível!"

# Solicitar credenciais de admin
echo ""
echo "Para criar o usuário de teste, precisamos das credenciais de admin do Keycloak:"
read -p "Admin Username: " ADMIN_USER
read -s -p "Admin Password: " ADMIN_PASS
echo ""

echo "🔑 Obtendo token de acesso..."

# Obter token de admin
TOKEN_RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$ADMIN_USER" \
    -d "password=$ADMIN_PASS" \
    -d "grant_type=password" \
    -d "client_id=admin-cli")

if [ $? -ne 0 ]; then
    echo "❌ Erro na conexão com Keycloak"
    exit 1
fi

TOKEN=$(echo $TOKEN_RESPONSE | jq -r .access_token 2>/dev/null)

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Erro ao obter token de admin. Verifique as credenciais."
    echo "Resposta do servidor: $TOKEN_RESPONSE"
    exit 1
fi

echo "✅ Token obtido com sucesso!"

echo "👤 Criando usuário 'test'..."

# Criar usuário test
USER_DATA='{
    "username": "test",
    "enabled": true,
    "email": "test@convflow.com",
    "firstName": "Test",
    "lastName": "User",
    "emailVerified": true,
    "credentials": [
        {
            "type": "password",
            "value": "123456",
            "temporary": false
        }
    ]
}'

CREATE_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$USER_DATA")

HTTP_CODE="${CREATE_RESPONSE: -3}"
RESPONSE_BODY="${CREATE_RESPONSE%???}"

if [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Usuário 'test' criado com sucesso!"
    
    # Obter ID do usuário criado
    USER_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/users?username=test" \
        -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')
    
    if [ "$USER_ID" != "null" ] && [ ! -z "$USER_ID" ]; then
        echo "📋 ID do usuário: $USER_ID"
        
        # Verificar se existe role 'admin'
        ADMIN_ROLE=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/roles/admin" \
            -H "Authorization: Bearer $TOKEN" 2>/dev/null)
        
        if [ $? -eq 0 ] && [ "$ADMIN_ROLE" != "" ]; then
            echo "🔧 Atribuindo role 'admin' ao usuário..."
            
            # Atribuir role admin
            ROLE_DATA='[
                {
                    "id": "'$(echo $ADMIN_ROLE | jq -r .id)'",
                    "name": "admin"
                }
            ]'
            
            curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users/$USER_ID/role-mappings/realm" \
                -H "Authorization: Bearer $TOKEN" \
                -H "Content-Type: application/json" \
                -d "$ROLE_DATA"
            
            if [ $? -eq 0 ]; then
                echo "✅ Role 'admin' atribuída com sucesso!"
            else
                echo "⚠️  Usuário criado, mas não foi possível atribuir role 'admin'"
            fi
        else
            echo "⚠️  Role 'admin' não encontrada no realm"
        fi
    fi
    
elif [ "$HTTP_CODE" = "409" ]; then
    echo "⚠️  Usuário 'test' já existe!"
    echo "   Você pode usar as credenciais: test / 123456"
else
    echo "❌ Erro ao criar usuário (HTTP $HTTP_CODE)"
    echo "Resposta: $RESPONSE_BODY"
    exit 1
fi

echo ""
echo "========================================"
echo "    Configuração Completa!"
echo "========================================"
echo ""
echo "🧪 Credenciais do usuário de teste:"
echo "   Username: test"
echo "   Email: test@convflow.com"
echo "   Password: 123456"
echo "   Role: admin (se atribuída)"
echo ""
echo "🌐 Keycloak Info:"
echo "   URL: $KEYCLOAK_URL"
echo "   Realm: $REALM"
echo "   Client ID: qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8"
echo ""
echo "▶️  Agora você pode:"
echo "   1. Iniciar o frontend: npm run dev"
echo "   2. Fazer login com: test / 123456"
echo ""
