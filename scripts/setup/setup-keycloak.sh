#!/bin/bash

echo "========================================"
echo "    ConvFlow - Setup Keycloak"
echo "========================================"
echo ""

# Verificar se o Docker está rodando
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente."
    exit 1
fi

echo "🐳 Iniciando Keycloak..."
docker-compose -f docker-compose.keycloak.yml up -d keycloak-db keycloak

echo ""
echo "⏳ Aguardando Keycloak inicializar (isso pode levar alguns minutos)..."

# Função para verificar se o Keycloak está pronto
check_keycloak() {
    curl -s http://localhost:8080/realms/master/.well-known/openid_configuration >/dev/null 2>&1
}

# Aguardar até 300 segundos (5 minutos)
for i in {1..60}; do
    if check_keycloak; then
        echo "✅ Keycloak está pronto!"
        break
    fi
    
    if [ $i -eq 60 ]; then
        echo "❌ Timeout: Keycloak não iniciou em 5 minutos"
        echo "Verifique os logs: docker-compose -f docker-compose.keycloak.yml logs keycloak"
        exit 1
    fi
    
    echo "⏳ Aguardando... ($i/60)"
    sleep 5
done

echo ""
echo "🔧 Importando realm ConvFlow..."

# Importar o realm usando a API do Keycloak
TOKEN=$(curl -s -X POST "http://localhost:8080/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=admin" \
    -d "password=admin123" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" | jq -r .access_token)

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
    echo "✅ Token de admin obtido"
    
    # Importar realm
    curl -s -X POST "http://localhost:8080/admin/realms" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d @keycloak-setup/convflow-realm.json
    
    if [ $? -eq 0 ]; then
        echo "✅ Realm 'convflow' criado com sucesso!"
        echo ""
        echo "========================================"
        echo "    Keycloak Setup Completo!"
        echo "========================================"
        echo ""
        echo "📱 Acesso ao Keycloak:"
        echo "  URL: http://localhost:8080"
        echo "  Admin Console: http://localhost:8080/admin"
        echo "  Username: admin"
        echo "  Password: admin123"
        echo ""
        echo "🧪 Usuário de teste criado:"
        echo "  Username: test"
        echo "  Email: test@convflow.com"
        echo "  Password: 123456"
        echo "  Roles: admin, user"
        echo ""
        echo "🔧 Configurações do Frontend:"
        echo "  VITE_KEYCLOAK_URL=http://localhost:8080"
        echo "  VITE_KEYCLOAK_REALM=convflow"
        echo "  VITE_KEYCLOAK_CLIENT_ID=convflow-app"
        echo ""
        echo "▶️  Para iniciar o frontend:"
        echo "     cd frontend && npm run dev"
        echo ""
    else
        echo "❌ Erro ao criar realm"
    fi
else
    echo "❌ Erro ao obter token de admin"
fi
