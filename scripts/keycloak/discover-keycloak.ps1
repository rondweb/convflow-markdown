# ConvFlow - Descobrir Configuração do Keycloak
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    ConvFlow - Descobrir Keycloak" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$KEYCLOAK_URL = "https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net"

Write-Host "🔍 Investigando Keycloak em: $KEYCLOAK_URL" -ForegroundColor Yellow
Write-Host ""

# 1. Verificar página principal
Write-Host "1️⃣ Verificando página principal..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri $KEYCLOAK_URL -Method Get -TimeoutSec 10
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    
    # Procurar por links para realms ou admin
    if ($response.Content -match 'href="([^"]*realms[^"]*)"') {
        Write-Host "   📍 Link para realms encontrado: $($matches[1])" -ForegroundColor Cyan
    }
    
    if ($response.Content -match 'href="([^"]*admin[^"]*)"') {
        Write-Host "   📍 Link para admin encontrado: $($matches[1])" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Testar paths comuns
Write-Host ""
Write-Host "2️⃣ Testando paths comuns..." -ForegroundColor White

$commonPaths = @(
    "/auth",
    "/auth/realms/master",
    "/auth/realms/master/.well-known/openid_configuration",
    "/realms/master",
    "/realms/master/.well-known/openid_configuration",
    "/admin",
    "/auth/admin"
)

foreach ($path in $commonPaths) {
    try {
        $testUrl = $KEYCLOAK_URL + $path
        $response = Invoke-WebRequest -Uri $testUrl -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Host "   ✅ $path - Status: $($response.StatusCode)" -ForegroundColor Green
        
        # Se for um endpoint de configuração, mostrar alguns detalhes
        if ($path -like "*well-known*" -and $response.Content.StartsWith("{")) {
            $config = $response.Content | ConvertFrom-Json
            if ($config.authorization_endpoint) {
                Write-Host "      📋 Authorization endpoint: $($config.authorization_endpoint)" -ForegroundColor Cyan
            }
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404) {
            Write-Host "   ❌ $path - 404 Not Found" -ForegroundColor Red
        } elseif ($statusCode -eq 302) {
            Write-Host "   🔄 $path - 302 Redirect" -ForegroundColor Yellow
        } else {
            Write-Host "   ⚠️  $path - $statusCode" -ForegroundColor Yellow
        }
    }
}

# 3. Procurar por realms existentes
Write-Host ""
Write-Host "3️⃣ Procurando realms existentes..." -ForegroundColor White

$possibleRealms = @("master", "convflow", "default", "main")

foreach ($realm in $possibleRealms) {
    foreach ($prefix in @("", "/auth")) {
        try {
            $testUrl = "$KEYCLOAK_URL$prefix/realms/$realm/.well-known/openid_configuration"
            $response = Invoke-RestMethod -Uri $testUrl -Method Get -TimeoutSec 5 -ErrorAction Stop
            Write-Host "   ✅ Realm '$realm' encontrado em: $prefix/realms/$realm" -ForegroundColor Green
            Write-Host "      📋 Issuer: $($response.issuer)" -ForegroundColor Cyan
            Write-Host "      📋 Auth endpoint: $($response.authorization_endpoint)" -ForegroundColor Cyan
        } catch {
            # Silencioso - só mostra se encontrar
        }
    }
}

Write-Host ""
Write-Host "4️⃣ Testando acesso ao Admin Console..." -ForegroundColor White

$adminPaths = @("/admin", "/auth/admin", "/admin/master/console")

foreach ($path in $adminPaths) {
    try {
        $testUrl = $KEYCLOAK_URL + $path
        $response = Invoke-WebRequest -Uri $testUrl -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Host "   ✅ Admin Console acessível em: $path" -ForegroundColor Green
        
        if ($response.Content -match 'Keycloak') {
            Write-Host "      📋 Página do Keycloak detectada" -ForegroundColor Cyan
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -ne 404) {
            Write-Host "   🔄 $path - Status: $statusCode" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Investigação Completa!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Green
Write-Host "   1. Se nenhum realm foi encontrado, acesse o Admin Console" -ForegroundColor White
Write-Host "   2. Crie o realm 'convflow' manualmente" -ForegroundColor White
Write-Host "   3. Configure o cliente com ID: qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8" -ForegroundColor White
Write-Host "   4. Crie o usuário 'test' com senha '123456'" -ForegroundColor White
Write-Host ""
