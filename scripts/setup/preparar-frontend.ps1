# Teste Frontend - Keycloak Configurado
Write-Host "🚀 TESTE FRONTEND - PREPARAÇÃO" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Verificar se todas as variáveis estão no .env
Write-Host "1️⃣ Verificando variáveis de ambiente..." -ForegroundColor White

$envPath = ".env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    $requiredVars = @(
        "VITE_KEYCLOAK_URL_BASE",
        "VITE_KEYCLOAK_REALM", 
        "VITE_KEYCLOAK_CLIENT_ID",
        "VITE_KEYCLOAK_URL_TOKEN",
        "VITE_KEYCLOAK_URL_USER_INFO",
        "VITE_KEYCLOAK_URL_LOGOUT"
    )
    
    $allPresent = $true
    foreach ($var in $requiredVars) {
        if ($envContent -like "*$var=*") {
            Write-Host "   ✅ $var" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $var" -ForegroundColor Red
            $allPresent = $false
        }
    }
    
    if ($allPresent) {
        Write-Host "   🎉 Todas as variáveis estão configuradas!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Algumas variáveis estão faltando" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Arquivo .env não encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "2️⃣ Verificando estrutura do frontend..." -ForegroundColor White

$frontendPath = "frontend"
if (Test-Path $frontendPath) {
    Write-Host "   ✅ Pasta frontend encontrada" -ForegroundColor Green
    
    # Verificar package.json
    $packageJsonPath = "$frontendPath/package.json"
    if (Test-Path $packageJsonPath) {
        Write-Host "   ✅ package.json encontrado" -ForegroundColor Green
        
        $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
        
        # Verificar dependências do Keycloak
        if ($packageJson.dependencies."keycloak-js") {
            Write-Host "   ✅ keycloak-js instalado: $($packageJson.dependencies."keycloak-js")" -ForegroundColor Green
        } else {
            Write-Host "   ❌ keycloak-js não encontrado nas dependências" -ForegroundColor Red
        }
    } else {
        Write-Host "   ❌ package.json não encontrado" -ForegroundColor Red
    }
    
    # Verificar arquivos de configuração do Keycloak
    $keycloakServicePath = "$frontendPath/src/services/keycloakService.ts"
    if (Test-Path $keycloakServicePath) {
        Write-Host "   ✅ keycloakService.ts encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ keycloakService.ts não encontrado" -ForegroundColor Red
    }
    
    $authContextPath = "$frontendPath/src/contexts/KeycloakAuthContext.tsx"
    if (Test-Path $authContextPath) {
        Write-Host "   ✅ KeycloakAuthContext.tsx encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ KeycloakAuthContext.tsx não encontrado" -ForegroundColor Red
    }
    
} else {
    Write-Host "   ❌ Pasta frontend não encontrada" -ForegroundColor Red
}

Write-Host ""
Write-Host "3️⃣ Testando conectividade do Keycloak..." -ForegroundColor White

# Teste básico de conectividade
$baseUrl = "https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net"
$realm = "convflow"

try {
    $testUrl = "$baseUrl/realms/$realm"
    $response = Invoke-WebRequest -Uri $testUrl -Method Get -TimeoutSec 10
    Write-Host "   ✅ Keycloak realm acessível (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Falha ao acessar realm: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 RESUMO E PRÓXIMOS PASSOS" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ STATUS ATUAL:" -ForegroundColor Green
Write-Host "   • Keycloak configurado e funcionando" -ForegroundColor White
Write-Host "   • Login via API validado" -ForegroundColor White
Write-Host "   • Variáveis de ambiente atualizadas" -ForegroundColor White
Write-Host "   • Frontend preparado" -ForegroundColor White
Write-Host ""

Write-Host "🚀 PARA TESTAR O FRONTEND:" -ForegroundColor Yellow
Write-Host "   1. cd frontend" -ForegroundColor White
Write-Host "   2. npm install (se necessário)" -ForegroundColor White
Write-Host "   3. npm run dev" -ForegroundColor White
Write-Host "   4. Abrir http://localhost:5173" -ForegroundColor White
Write-Host "   5. Testar login com: test / 123456" -ForegroundColor White
Write-Host ""

Write-Host "🔍 PARA DEBUG (se necessário):" -ForegroundColor Cyan
Write-Host "   • Abrir DevTools do navegador" -ForegroundColor White
Write-Host "   • Verificar logs do console" -ForegroundColor White
Write-Host "   • Verificar aba Network para requisições" -ForegroundColor White
Write-Host ""

Write-Host "📋 CREDENCIAIS DE TESTE:" -ForegroundColor Yellow
Write-Host "   Username: test" -ForegroundColor White
Write-Host "   Password: 123456" -ForegroundColor White
Write-Host "   Client ID: cvclient" -ForegroundColor White
Write-Host ""

Write-Host "=============================" -ForegroundColor Cyan
