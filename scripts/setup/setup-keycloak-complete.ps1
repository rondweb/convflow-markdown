# ConvFlow - Configuração Completa do Keycloak
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    ConvFlow - Configuração Keycloak" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$KEYCLOAK_URL = "https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net"
$REALM = "convflow"
$CLIENT_ID = "qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8"
$CLIENT_SECRET = "vBzQUPG9KjHpaFEgHK4UiBq66eB1qUhR"

Write-Host "🔍 Verificando configuração atual..." -ForegroundColor Yellow
Write-Host "   Keycloak URL: $KEYCLOAK_URL" -ForegroundColor White
Write-Host "   Realm: $REALM" -ForegroundColor White
Write-Host "   Client ID: $CLIENT_ID" -ForegroundColor White
Write-Host ""

# 1. Verificar se o realm existe
Write-Host "1️⃣ Verificando realm '$REALM'..." -ForegroundColor White

$realmExists = $false
$realmUrl = ""

# Testar diferentes caminhos
$testPaths = @(
    "/realms/$REALM",
    "/auth/realms/$REALM"
)

foreach ($path in $testPaths) {
    try {
        $testUrl = "$KEYCLOAK_URL$path/.well-known/openid_configuration"
        $response = Invoke-RestMethod -Uri $testUrl -Method Get -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.issuer) {
            Write-Host "   ✅ Realm encontrado em: $path" -ForegroundColor Green
            Write-Host "      Issuer: $($response.issuer)" -ForegroundColor Cyan
            $realmExists = $true
            $realmUrl = "$KEYCLOAK_URL$path"
            break
        }
    } catch {
        # Continuar testando
    }
}

if (-not $realmExists) {
    Write-Host "   ❌ Realm '$REALM' não encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 O realm precisa ser criado. Siga estes passos:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Acesse o Admin Console:" -ForegroundColor White
    Write-Host "   $KEYCLOAK_URL/admin" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Faça login como administrador" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Crie um novo realm:" -ForegroundColor White
    Write-Host "   - Nome: $REALM" -ForegroundColor Cyan
    Write-Host "   - Enabled: ✅" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "4. Configure o cliente:" -ForegroundColor White
    Write-Host "   - Client ID: $CLIENT_ID" -ForegroundColor Cyan
    Write-Host "   - Client Secret: $CLIENT_SECRET" -ForegroundColor Cyan
    Write-Host "   - Access Type: confidential" -ForegroundColor Cyan
    Write-Host "   - Valid Redirect URIs: http://localhost:5173/*" -ForegroundColor Cyan
    Write-Host "   - Web Origins: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "5. Crie o usuário:" -ForegroundColor White
    Write-Host "   - Username: test" -ForegroundColor Cyan
    Write-Host "   - Email: test@convflow.com" -ForegroundColor Cyan
    Write-Host "   - Password: 123456" -ForegroundColor Cyan
    Write-Host "   - Roles: admin" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Após criar, execute novamente este script para testar." -ForegroundColor Green
    exit
}

# 2. Testar login com as credenciais
Write-Host "2️⃣ Testando login com credenciais..." -ForegroundColor White

$tokenUrl = "$realmUrl/protocol/openid-connect/token"

# Testar com username
$bodyUser = @{
    username = "test"
    password = "123456"
    grant_type = "password"
    client_id = $CLIENT_ID
    client_secret = $CLIENT_SECRET
}

Write-Host "   🧪 Testando com username 'test'..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $bodyUser -ContentType "application/x-www-form-urlencoded" -ErrorAction Stop
    
    Write-Host "   ✅ Login bem-sucedido com username!" -ForegroundColor Green
    
    # Decodificar token para mostrar informações
    $tokenParts = $response.access_token.Split('.')
    $payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[1].PadRight(($tokenParts[1].Length + 3) -band -4, '=')))
    $userInfo = $payload | ConvertFrom-Json
    
    Write-Host "   📋 Informações do usuário:" -ForegroundColor Cyan
    Write-Host "      Username: $($userInfo.preferred_username)" -ForegroundColor White
    Write-Host "      Email: $($userInfo.email)" -ForegroundColor White
    Write-Host "      Roles: $($userInfo.realm_access.roles -join ', ')" -ForegroundColor White
    
    $loginSuccess = $true
    
} catch {
    Write-Host "   ❌ Falha no login com username" -ForegroundColor Red
    
    # Testar com email
    Write-Host "   🧪 Testando com email 'test@convflow.com'..." -ForegroundColor Yellow
    
    $bodyEmail = @{
        username = "test@convflow.com"
        password = "123456"
        grant_type = "password"
        client_id = $CLIENT_ID
        client_secret = $CLIENT_SECRET
    }
    
    try {
        $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $bodyEmail -ContentType "application/x-www-form-urlencoded" -ErrorAction Stop
        
        Write-Host "   ✅ Login bem-sucedido com email!" -ForegroundColor Green
        $loginSuccess = $true
        
    } catch {
        Write-Host "   ❌ Falha no login com email também" -ForegroundColor Red
        Write-Host "   📋 Erro: $($_.Exception.Message)" -ForegroundColor Yellow
        $loginSuccess = $false
    }
}

# 3. Atualizar configurações do frontend se necessário
if ($loginSuccess) {
    Write-Host ""
    Write-Host "3️⃣ Verificando configurações do frontend..." -ForegroundColor White
    
    $envPath = ".env"
    if (Test-Path $envPath) {
        $envContent = Get-Content $envPath -Raw
        
        # Verificar se o URL está correto
        if ($realmUrl -like "*auth/realms*" -and $envContent -notlike "*auth*") {
            Write-Host "   ⚠️  URL do Keycloak precisa ser atualizado!" -ForegroundColor Yellow
            Write-Host "   📋 Atualize o .env com:" -ForegroundColor Cyan
            Write-Host "      VITE_KEYCLOAK_URL=$KEYCLOAK_URL/auth" -ForegroundColor White
        } else {
            Write-Host "   ✅ Configurações do frontend estão corretas" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "🎉 Sucesso! Configuração completa!" -ForegroundColor Green
    Write-Host ""
    Write-Host "▶️  Para testar o frontend:" -ForegroundColor Yellow
    Write-Host "   1. cd frontend" -ForegroundColor White
    Write-Host "   2. npm run dev" -ForegroundColor White
    Write-Host "   3. Acesse: http://localhost:5173" -ForegroundColor White
    Write-Host "   4. Login: test / 123456" -ForegroundColor White
    
} else {
    Write-Host ""
    Write-Host "❌ Configuração incompleta" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Possíveis problemas:" -ForegroundColor Yellow
    Write-Host "   1. Usuário 'test' não existe" -ForegroundColor White
    Write-Host "   2. Senha não é '123456'" -ForegroundColor White
    Write-Host "   3. Cliente não está configurado corretamente" -ForegroundColor White
    Write-Host "   4. Direct Access Grants não está habilitado" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Acesse o Admin Console para verificar:" -ForegroundColor Yellow
    Write-Host "   $KEYCLOAK_URL/admin" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
