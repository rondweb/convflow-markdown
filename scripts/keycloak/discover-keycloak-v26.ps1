# ConvFlow - Discovery Keycloak v26.3.2
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Keycloak v26.3.2 - Discovery Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$KEYCLOAK_URL = "https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net"

Write-Host "🔍 Detectando estrutura do Keycloak v26.3.2..." -ForegroundColor Yellow
Write-Host "   Server: $KEYCLOAK_URL" -ForegroundColor White
Write-Host ""

# URLs possíveis no Keycloak v26+
$testUrls = @(
    # Nova estrutura (v26+)
    "$KEYCLOAK_URL/realms/master/.well-known/openid_configuration",
    "$KEYCLOAK_URL/realms/master",
    
    # Estrutura legacy (v25-)
    "$KEYCLOAK_URL/auth/realms/master/.well-known/openid_configuration", 
    "$KEYCLOAK_URL/auth/realms/master",
    
    # Admin Console
    "$KEYCLOAK_URL/admin",
    "$KEYCLOAK_URL/admin/master/console",
    
    # Health check
    "$KEYCLOAK_URL/health",
    "$KEYCLOAK_URL/health/ready"
)

Write-Host "1️⃣ Testando endpoints disponíveis..." -ForegroundColor White
Write-Host ""

$foundEndpoints = @()
$adminUrl = ""
$realmStructure = ""

foreach ($url in $testUrls) {
    try {
        Write-Host "   🧪 Testando: $url" -ForegroundColor Gray
        
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ $url - Disponível" -ForegroundColor Green
            $foundEndpoints += $url
            
            # Detectar tipo de endpoint
            if ($url -like "*admin*") {
                $adminUrl = $url
            }
            if ($url -like "*realms/master*" -and $url -like "*openid_configuration*") {
                if ($url -like "*auth/realms*") {
                    $realmStructure = "legacy"
                } else {
                    $realmStructure = "new"
                }
            }
        }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 302) {
            Write-Host "   ↗️  $url - Redirecionamento (OK)" -ForegroundColor Yellow
            $foundEndpoints += $url
            
            if ($url -like "*admin*") {
                $adminUrl = $url
            }
        } else {
            Write-Host "   ❌ $url - Não disponível" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "2️⃣ Estrutura detectada:" -ForegroundColor White

if ($realmStructure -eq "new") {
    Write-Host "   ✅ Keycloak v26+ (nova estrutura sem /auth)" -ForegroundColor Green
    $baseRealmUrl = "$KEYCLOAK_URL/realms"
    $correctEnvUrl = $KEYCLOAK_URL
} elseif ($realmStructure -eq "legacy") {
    Write-Host "   ⚠️  Keycloak com estrutura legacy (/auth)" -ForegroundColor Yellow
    $baseRealmUrl = "$KEYCLOAK_URL/auth/realms"
    $correctEnvUrl = "$KEYCLOAK_URL/auth"
} else {
    Write-Host "   ❓ Estrutura não detectada - testando manualmente" -ForegroundColor Yellow
    $baseRealmUrl = "$KEYCLOAK_URL/realms"
    $correctEnvUrl = $KEYCLOAK_URL
}

Write-Host "   📍 Base URL para realms: $baseRealmUrl" -ForegroundColor Cyan
Write-Host "   📍 URL para .env: $correctEnvUrl" -ForegroundColor Cyan

Write-Host ""
Write-Host "3️⃣ Verificando realms existentes..." -ForegroundColor White

# Testar realms conhecidos
$knownRealms = @("master", "convflow")
$existingRealms = @()

foreach ($realm in $knownRealms) {
    try {
        $realmUrl = "$baseRealmUrl/$realm/.well-known/openid_configuration"
        $response = Invoke-RestMethod -Uri $realmUrl -Method Get -TimeoutSec 5 -ErrorAction Stop
        
        Write-Host "   ✅ Realm '$realm' encontrado" -ForegroundColor Green
        Write-Host "      Issuer: $($response.issuer)" -ForegroundColor Gray
        $existingRealms += $realm
        
    } catch {
        Write-Host "   ❌ Realm '$realm' não encontrado" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "4️⃣ Admin Console:" -ForegroundColor White

if ($adminUrl) {
    Write-Host "   ✅ Admin Console disponível em: $adminUrl" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Admin Console não detectado automaticamente" -ForegroundColor Yellow
    Write-Host "   🔧 Tente acessar: $KEYCLOAK_URL/admin" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           RESULTADO FINAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($existingRealms -contains "convflow") {
    Write-Host "🎉 REALM 'convflow' ENCONTRADO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Sua configuração está correta:" -ForegroundColor Green
    Write-Host "   VITE_KEYCLOAK_URL=$correctEnvUrl" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 Testando login agora..." -ForegroundColor Yellow
    
    # Testar login
    $tokenUrl = "$baseRealmUrl/convflow/protocol/openid-connect/token"
    
    $loginData = @{
        username = "test"
        password = "123456"
        grant_type = "password"
        client_id = "qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8"
        client_secret = "vBzQUPG9KjHpaFEgHK4UiBq66eB1qUhR"
    }
    
    try {
        $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $loginData -ContentType "application/x-www-form-urlencoded"
        Write-Host "🎉 LOGIN BEM-SUCEDIDO!" -ForegroundColor Green
        Write-Host "   Access Token obtido com sucesso" -ForegroundColor White
        
    } catch {
        Write-Host "❌ Falha no login:" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🔧 Possíveis soluções:" -ForegroundColor Cyan
        Write-Host "   1. Usuário 'test' não existe" -ForegroundColor White
        Write-Host "   2. Senha incorreta" -ForegroundColor White
        Write-Host "   3. Cliente não configurado" -ForegroundColor White
        Write-Host "   4. Direct Access Grants desabilitado" -ForegroundColor White
    }
    
} else {
    Write-Host "❌ REALM 'convflow' NÃO ENCONTRADO" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Instruções para Keycloak v26.3.2:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1️⃣ Acesse o Admin Console:" -ForegroundColor White
    if ($adminUrl) {
        Write-Host "   $adminUrl" -ForegroundColor Cyan
    } else {
        Write-Host "   $KEYCLOAK_URL/admin" -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Host "2️⃣ Crie o realm 'convflow':" -ForegroundColor White
    Write-Host "   - No menu dropdown (canto superior esquerdo)" -ForegroundColor Gray
    Write-Host "   - Clique em 'Create realm'" -ForegroundColor Gray
    Write-Host "   - Name: convflow" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3️⃣ Configure o client:" -ForegroundColor White
    Write-Host "   - Clients → Create client" -ForegroundColor Gray
    Write-Host "   - Client ID: qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8" -ForegroundColor Gray
    Write-Host "   - Client authentication: ON" -ForegroundColor Gray
    Write-Host "   - Authorization: OFF" -ForegroundColor Gray
    Write-Host "   - Valid redirect URIs: http://localhost:5173/*" -ForegroundColor Gray
    Write-Host "   - Web origins: http://localhost:5173" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4️⃣ Configure client secret na aba Credentials:" -ForegroundColor White
    Write-Host "   - Client secret: vBzQUPG9KjHpaFEgHK4UiBq66eB1qUhR" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5️⃣ Crie o usuário 'test':" -ForegroundColor White
    Write-Host "   - Users → Create new user" -ForegroundColor Gray
    Write-Host "   - Username: test" -ForegroundColor Gray
    Write-Host "   - Email: test@convflow.com" -ForegroundColor Gray
    Write-Host "   - Email verified: ON" -ForegroundColor Gray
    Write-Host "   - Credentials → Set password: 123456" -ForegroundColor Gray
    Write-Host "   - Temporary: OFF" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🔧 Configuração recomendada para .env:" -ForegroundColor Yellow
Write-Host "VITE_KEYCLOAK_URL=$correctEnvUrl" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
