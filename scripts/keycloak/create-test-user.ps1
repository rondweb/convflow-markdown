# ConvFlow - Criar Usuário Test no Keycloak
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    ConvFlow - Criando Usuário Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$KEYCLOAK_URL = "https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net"
$REALM = "convflow"

Write-Host "🔐 Conectando ao Keycloak em: $KEYCLOAK_URL" -ForegroundColor Yellow

# Verificar se o Keycloak está acessível
try {
    $testResponse = Invoke-RestMethod -Uri "$KEYCLOAK_URL/realms/$REALM/.well-known/openid_configuration" -TimeoutSec 10
    Write-Host "✅ Keycloak acessível!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro: Não foi possível conectar ao Keycloak" -ForegroundColor Red
    Write-Host "   Verifique se o Keycloak está rodando em: $KEYCLOAK_URL" -ForegroundColor Red
    Write-Host "   Verifique se o realm '$REALM' existe" -ForegroundColor Red
    exit 1
}

# Solicitar credenciais de admin
Write-Host ""
Write-Host "Para criar o usuário de teste, precisamos das credenciais de admin do Keycloak:" -ForegroundColor Yellow
$adminUser = Read-Host "Admin Username"
$adminPassSecure = Read-Host "Admin Password" -AsSecureString
$adminPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPassSecure))

Write-Host "🔑 Obtendo token de acesso..." -ForegroundColor Yellow

# Obter token de admin
$tokenBody = @{
    username = $adminUser
    password = $adminPass
    grant_type = "password"
    client_id = "admin-cli"
}

try {
    $tokenResponse = Invoke-RestMethod -Uri "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" -Method Post -Body $tokenBody -ContentType "application/x-www-form-urlencoded"
    $token = $tokenResponse.access_token
    Write-Host "✅ Token obtido com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao obter token de admin. Verifique as credenciais." -ForegroundColor Red
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "👤 Criando usuário 'test'..." -ForegroundColor Yellow

# Criar usuário test
$userData = @{
    username = "test"
    enabled = $true
    email = "test@convflow.com"
    firstName = "Test"
    lastName = "User"
    emailVerified = $true
    credentials = @(
        @{
            type = "password"
            value = "123456"
            temporary = $false
        }
    )
} | ConvertTo-Json -Depth 3

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $createResponse = Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM/users" -Method Post -Body $userData -Headers $headers
    Write-Host "✅ Usuário 'test' criado com sucesso!" -ForegroundColor Green
    
    # Obter ID do usuário criado
    $usersResponse = Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM/users?username=test" -Headers $headers
    if ($usersResponse.Count -gt 0) {
        $userId = $usersResponse[0].id
        Write-Host "📋 ID do usuário: $userId" -ForegroundColor Cyan
        
        # Verificar se existe role 'admin'
        try {
            $adminRole = Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM/roles/admin" -Headers $headers
            Write-Host "🔧 Atribuindo role 'admin' ao usuário..." -ForegroundColor Yellow
            
            # Atribuir role admin
            $roleData = @(
                @{
                    id = $adminRole.id
                    name = "admin"
                }
            ) | ConvertTo-Json -Depth 2
            
            Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM/users/$userId/role-mappings/realm" -Method Post -Body $roleData -Headers $headers
            Write-Host "✅ Role 'admin' atribuída com sucesso!" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Usuário criado, mas não foi possível atribuir role 'admin'" -ForegroundColor Yellow
            Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠️  Usuário 'test' já existe!" -ForegroundColor Yellow
        Write-Host "   Você pode usar as credenciais: test / 123456" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Erro ao criar usuário" -ForegroundColor Red
        Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Configuração Completa!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Credenciais do usuário de teste:" -ForegroundColor Green
Write-Host "   Username: test" -ForegroundColor White
Write-Host "   Email: test@convflow.com" -ForegroundColor White
Write-Host "   Password: 123456" -ForegroundColor White
Write-Host "   Role: admin (se atribuída)" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Keycloak Info:" -ForegroundColor Green
Write-Host "   URL: $KEYCLOAK_URL" -ForegroundColor White
Write-Host "   Realm: $REALM" -ForegroundColor White
Write-Host "   Client ID: qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8" -ForegroundColor White
Write-Host ""
Write-Host "▶️  Agora você pode:" -ForegroundColor Green
Write-Host "   1. Iniciar o frontend: npm run dev" -ForegroundColor White
Write-Host "   2. Fazer login com: test / 123456" -ForegroundColor White
Write-Host ""
