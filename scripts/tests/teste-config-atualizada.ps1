# Teste com Configurações Atualizadas
Write-Host "🔧 TESTE COM CONFIGURAÇÕES ATUALIZADAS" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Configurações extraídas do .env atualizado
$KEYCLOAK_BASE = "https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net"
$REALM = "convflow"
$CLIENT_ID = "cvclient"
$CLIENT_SECRET = "EaAMfY2er4Bg3qfs9TmRyVuehAcIWgcf"
$USERNAME = "test"
$PASSWORD = "123456"

# Endpoint correto do token (fornecido pelo usuário)
$TOKEN_ENDPOINT = "https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net/realms/convflow/protocol/openid-connect/token"

Write-Host "📋 Configurações:" -ForegroundColor Yellow
Write-Host "   Base URL: $KEYCLOAK_BASE" -ForegroundColor White
Write-Host "   Realm: $REALM" -ForegroundColor White
Write-Host "   Client ID: $CLIENT_ID" -ForegroundColor White
Write-Host "   Username: $USERNAME" -ForegroundColor White
Write-Host "   Token Endpoint: $TOKEN_ENDPOINT" -ForegroundColor White
Write-Host ""

# Testar configuração OpenID
Write-Host "1️⃣ Verificando configuração OpenID..." -ForegroundColor White

try {
    $openidConfig = Invoke-RestMethod -Uri "$KEYCLOAK_BASE/realms/$REALM/.well-known/openid_configuration" -Method Get
    Write-Host "   ✅ Configuração OpenID obtida com sucesso" -ForegroundColor Green
    Write-Host "   📍 Issuer: $($openidConfig.issuer)" -ForegroundColor Cyan
    Write-Host "   📍 Token Endpoint: $($openidConfig.token_endpoint)" -ForegroundColor Cyan
    Write-Host "   📍 Authorization Endpoint: $($openidConfig.authorization_endpoint)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Falha ao obter configuração OpenID: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2️⃣ Testando login com credenciais..." -ForegroundColor White

$loginData = @{
    username = $USERNAME
    password = $PASSWORD
    grant_type = "password"
    client_id = $CLIENT_ID
    client_secret = $CLIENT_SECRET
    scope = "openid profile email"
}

try {
    Write-Host "   🔐 Fazendo requisição de token..." -ForegroundColor Gray
    $tokenResponse = Invoke-RestMethod -Uri $TOKEN_ENDPOINT -Method Post -Body $loginData -ContentType "application/x-www-form-urlencoded"
    
    Write-Host "   ✅ LOGIN BEM-SUCEDIDO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   📋 Informações do Token:" -ForegroundColor Cyan
    Write-Host "      Access Token: $(($tokenResponse.access_token).Substring(0,50))..." -ForegroundColor White
    Write-Host "      Token Type: $($tokenResponse.token_type)" -ForegroundColor White
    Write-Host "      Expires In: $($tokenResponse.expires_in) segundos" -ForegroundColor White
    
    if ($tokenResponse.refresh_token) {
        Write-Host "      Refresh Token: Disponível" -ForegroundColor White
    }
    
    if ($tokenResponse.id_token) {
        Write-Host "      ID Token: Disponível" -ForegroundColor White
    }
    
    Write-Host ""
    
    # Testar endpoint de userinfo
    if ($openidConfig.userinfo_endpoint) {
        Write-Host "3️⃣ Testando endpoint de userinfo..." -ForegroundColor White
        
        $headers = @{
            Authorization = "$($tokenResponse.token_type) $($tokenResponse.access_token)"
        }
        
        try {
            $userInfo = Invoke-RestMethod -Uri $openidConfig.userinfo_endpoint -Method Get -Headers $headers
            
            Write-Host "   ✅ USERINFO BEM-SUCEDIDO!" -ForegroundColor Green
            Write-Host ""
            Write-Host "   👤 Dados do Usuário:" -ForegroundColor Cyan
            Write-Host "      Sub: $($userInfo.sub)" -ForegroundColor White
            Write-Host "      Username: $($userInfo.preferred_username)" -ForegroundColor White
            Write-Host "      Email: $($userInfo.email)" -ForegroundColor White
            Write-Host "      Email Verified: $($userInfo.email_verified)" -ForegroundColor White
            
            if ($userInfo.name) {
                Write-Host "      Name: $($userInfo.name)" -ForegroundColor White
            }
            
        } catch {
            Write-Host "   ⚠️  Falha ao obter userinfo: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "🎉 KEYCLOAK TOTALMENTE FUNCIONAL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Checklist de validação:" -ForegroundColor Yellow
    Write-Host "   ✅ Realm 'convflow' acessível" -ForegroundColor White
    Write-Host "   ✅ Cliente '$CLIENT_ID' configurado" -ForegroundColor White
    Write-Host "   ✅ Usuário '$USERNAME' funcional" -ForegroundColor White
    Write-Host "   ✅ Token obtido com sucesso" -ForegroundColor White
    Write-Host "   ✅ Endpoints funcionando" -ForegroundColor White
    
    Write-Host ""
    Write-Host "🚀 Próximo passo: Testar frontend React" -ForegroundColor Cyan
    Write-Host "   Execute: cd frontend && npm run dev" -ForegroundColor White
    
} catch {
    Write-Host "   ❌ Falha no login: $($_.Exception.Message)" -ForegroundColor Red
    
    # Tentar capturar mais detalhes do erro
    if ($_.Exception.Response) {
        try {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "   📊 Status Code: $statusCode" -ForegroundColor Yellow
            
            # Para PowerShell Core, usar ReadAsStringAsync
            $errorStream = $_.Exception.Response.Content
            if ($errorStream) {
                $errorBody = $errorStream.ReadAsStringAsync().Result
                Write-Host "   📋 Detalhes do erro: $errorBody" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   ⚠️  Não foi possível obter detalhes do erro" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "🔧 Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "   1. Verificar se o cliente '$CLIENT_ID' existe" -ForegroundColor White
    Write-Host "   2. Confirmar client secret correto" -ForegroundColor White
    Write-Host "   3. Verificar se 'Direct Access Grants' está habilitado" -ForegroundColor White
    Write-Host "   4. Confirmar credenciais do usuário" -ForegroundColor White
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
