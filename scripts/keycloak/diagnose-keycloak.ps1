# Verificação do Keycloak e Diagnóstico de Problemas

Este script ajuda a verificar a configuração do Keycloak e diagnosticar problemas de autenticação.

```powershell
# Script para diagnosticar problemas de Keycloak

# Verificar variáveis de ambiente
Write-Host "=== VERIFICANDO VARIÁVEIS DE AMBIENTE ===" -ForegroundColor Cyan

$frontendEnvPath = ".\.env.local"
$keycloakUrl = $null
$keycloakRealm = $null
$keycloakClientId = $null

if (Test-Path $frontendEnvPath) {
    $envContent = Get-Content $frontendEnvPath
    
    foreach ($line in $envContent) {
        if ($line -match "VITE_KEYCLOAK_URL_BASE=(.*)") {
            $keycloakUrl = $matches[1]
        }
        elseif ($line -match "VITE_KEYCLOAK_REALM=(.*)") {
            $keycloakRealm = $matches[1]
        }
        elseif ($line -match "VITE_KEYCLOAK_CLIENT_ID=(.*)") {
            $keycloakClientId = $matches[1]
        }
    }
    
    Write-Host "Arquivo .env.local encontrado:" -ForegroundColor Green
    Write-Host "URL do Keycloak: $keycloakUrl"
    Write-Host "Realm: $keycloakRealm"
    Write-Host "Client ID: $keycloakClientId"
    
    # Verificar valores
    if ($keycloakClientId -ne "cvclient") {
        Write-Host "ERRO: Client ID está configurado como '$keycloakClientId', mas deveria ser 'cvclient'" -ForegroundColor Red
    } else {
        Write-Host "Client ID está configurado corretamente como 'cvclient'" -ForegroundColor Green
    }
    
    if (-not $keycloakUrl -or -not $keycloakRealm -or -not $keycloakClientId) {
        Write-Host "AVISO: Algumas variáveis de ambiente estão faltando" -ForegroundColor Yellow
    }
} else {
    Write-Host "ERRO: Arquivo .env.local não encontrado" -ForegroundColor Red
    Write-Host "Crie o arquivo com as seguintes variáveis:" -ForegroundColor Yellow
    Write-Host "VITE_KEYCLOAK_URL_BASE=https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net" -ForegroundColor Yellow
    Write-Host "VITE_KEYCLOAK_REALM=convflow" -ForegroundColor Yellow
    Write-Host "VITE_KEYCLOAK_CLIENT_ID=cvclient" -ForegroundColor Yellow
}

# Verificar configuração do Keycloak
Write-Host "`n=== VERIFICANDO CONFIGURAÇÃO DO KEYCLOAK ===" -ForegroundColor Cyan

# Se temos a URL do Keycloak, tentar acessar para verificar se está online
if ($keycloakUrl) {
    try {
        $response = Invoke-WebRequest -Uri "$keycloakUrl/realms/$keycloakRealm/.well-known/openid-configuration" -TimeoutSec 5
        Write-Host "Keycloak está acessível e respondendo" -ForegroundColor Green
        
        # Verificar se o cliente existe
        try {
            $clientsResponse = Invoke-WebRequest -Uri "$keycloakUrl/realms/$keycloakRealm/clients-registrations/default" -TimeoutSec 5
            Write-Host "API de clientes do Keycloak está acessível" -ForegroundColor Green
        } catch {
            Write-Host "Não foi possível verificar os clientes do Keycloak (isto é normal sem autenticação)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "ERRO: Não foi possível acessar o Keycloak em $keycloakUrl" -ForegroundColor Red
        Write-Host "Detalhes do erro: $_" -ForegroundColor Red
    }
} else {
    Write-Host "AVISO: URL do Keycloak não encontrada, não é possível verificar a disponibilidade" -ForegroundColor Yellow
}

# Verificar arquivos de script necessários
Write-Host "`n=== VERIFICANDO ARQUIVOS DE SCRIPT ===" -ForegroundColor Cyan

$requiredScripts = @(
    "./public/silent-check-sso.html",
    "./src/services/keycloakService.ts",
    "./public/auth-check.js",
    "./public/dashboard-handler.js"
)

foreach ($script in $requiredScripts) {
    if (Test-Path $script) {
        Write-Host "✓ $script encontrado" -ForegroundColor Green
    } else {
        Write-Host "✗ $script NÃO encontrado" -ForegroundColor Red
    }
}

# Verificar configurações no keycloakService.ts
Write-Host "`n=== VERIFICANDO CONFIGURAÇÕES NO KEYCLOAK SERVICE ===" -ForegroundColor Cyan

$keycloakServicePath = "./src/services/keycloakService.ts"
if (Test-Path $keycloakServicePath) {
    $content = Get-Content $keycloakServicePath -Raw
    
    if ($content -match "onLoad:\s*'login-required'") {
        Write-Host "✓ onLoad está configurado como 'login-required'" -ForegroundColor Green
    } elseif ($content -match "onLoad:\s*'check-sso'") {
        Write-Host "✗ onLoad está configurado como 'check-sso', deveria ser 'login-required'" -ForegroundColor Yellow
    } else {
        Write-Host "? Não foi possível determinar a configuração de onLoad" -ForegroundColor Yellow
    }
    
    if ($content -match "redirectUri:\s*window\.location\.origin\s*\+\s*'/dashboard'") {
        Write-Host "✓ redirectUri está configurado corretamente para o dashboard" -ForegroundColor Green
    } else {
        Write-Host "? Verifique a configuração de redirectUri no keycloakService.ts" -ForegroundColor Yellow
    }
    
    if ($content -match "return\s+keycloak\.login\(\{.*redirectUri:.*'/dashboard'.*\}\)") {
        Write-Host "✓ Método login() configura redirectUri corretamente" -ForegroundColor Green
    } else {
        Write-Host "? Verifique se o método login() configura redirectUri corretamente" -ForegroundColor Yellow
    }
}

# Instruções finais
Write-Host "`n=== RECOMENDAÇÕES ===" -ForegroundColor Cyan
Write-Host "1. Certifique-se de que o client ID está configurado como 'cvclient'"
Write-Host "2. Verifique se o cliente no Keycloak tem URLs de redirecionamento válidas"
Write-Host "3. Limpe o cache e cookies do navegador antes de testar"
Write-Host "4. Verifique o console do navegador para mensagens de erro"
Write-Host "5. Teste o fluxo completo de autenticação"

# Solução de problemas
Write-Host "`n=== SOLUÇÃO DE PROBLEMAS COMUNS ===" -ForegroundColor Cyan
Write-Host "• Se o redirecionamento volta para a página de login: Verifique se o client ID está correto e se redirectUri está configurado corretamente"
Write-Host "• Se o Keycloak mostra erro de 'invalid redirect_uri': Configure URLs válidas no cliente Keycloak"
Write-Host "• Se o token não está sendo armazenado: Verifique o armazenamento no localStorage e sessionStorage"
```

Execute este script para diagnosticar problemas com a configuração do Keycloak.
