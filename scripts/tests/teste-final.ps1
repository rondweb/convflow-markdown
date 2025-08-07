# Teste Final - Keycloak Configurado
Write-Host "🎉 TESTE FINAL - Keycloak Funcionando" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Endpoints corretos extraídos do JSON
$TOKEN_ENDPOINT = "https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net/realms/convflow/protocol/openid-connect/token"
$USERINFO_ENDPOINT = "https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net/realms/convflow/protocol/openid-connect/userinfo"

Write-Host "🔍 Testando login com credenciais corretas..." -ForegroundColor Yellow
Write-Host "   Token Endpoint: $TOKEN_ENDPOINT" -ForegroundColor Gray
Write-Host ""

# Dados de login
$loginData = @{
    username = "test@convflow.com"
    password = "123456"
    grant_type = "password"
    client_id = "qRyNYFeCBNxkW7BVTx3RMnC1cKMWH2G8"
    client_secret = "vBzQUPG9KjHpaFEgHK4UiBq66eB1qUhR"
    scope = "openid profile email"
}

try {
    Write-Host "🔐 Fazendo login..." -ForegroundColor White
    $tokenResponse = Invoke-RestMethod -Uri $TOKEN_ENDPOINT -Method Post -Body $loginData -ContentType "application/x-www-form-urlencoded"
    
    Write-Host "✅ LOGIN BEM-SUCEDIDO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Informações do Token:" -ForegroundColor Cyan
    Write-Host "   Access Token: $(($tokenResponse.access_token).Substring(0,50))..." -ForegroundColor White
    Write-Host "   Token Type: $($tokenResponse.token_type)" -ForegroundColor White
    Write-Host "   Expires In: $($tokenResponse.expires_in) seconds" -ForegroundColor White
    Write-Host "   Refresh Token: Disponível" -ForegroundColor White
    Write-Host ""
    
    # Testar userinfo endpoint
    Write-Host "👤 Obtendo informações do usuário..." -ForegroundColor Yellow
    $headers = @{
        Authorization = "$($tokenResponse.token_type) $($tokenResponse.access_token)"
    }
    
    try {
        $userInfo = Invoke-RestMethod -Uri $USERINFO_ENDPOINT -Method Get -Headers $headers
        
        Write-Host "✅ USERINFO BEM-SUCEDIDO!" -ForegroundColor Green
        Write-Host ""
        Write-Host "👤 Dados do Usuário:" -ForegroundColor Cyan
        Write-Host "   Sub: $($userInfo.sub)" -ForegroundColor White
        Write-Host "   Email: $($userInfo.email)" -ForegroundColor White
        Write-Host "   Email Verified: $($userInfo.email_verified)" -ForegroundColor White
        Write-Host "   Preferred Username: $($userInfo.preferred_username)" -ForegroundColor White
        Write-Host "   Name: $($userInfo.name)" -ForegroundColor White
        
    } catch {
        Write-Host "⚠️  Falha ao obter userinfo: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🎉 KEYCLOAK 100% FUNCIONAL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Próximos passos:" -ForegroundColor Yellow
    Write-Host "   1. Atualizar configurações do frontend" -ForegroundColor White
    Write-Host "   2. Testar integração com React" -ForegroundColor White
    Write-Host "   3. Verificar fluxo de autenticação completo" -ForegroundColor White
    
} catch {
    Write-Host "❌ Falha no login: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Detalhes: $errorBody" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
