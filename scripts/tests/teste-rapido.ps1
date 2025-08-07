# Teste Rápido - Keycloak v26.3.2
Write-Host "🧪 Teste Rápido - Keycloak Configurado" -ForegroundColor Cyan
Write-Host ""

$KEYCLOAK_URL = "https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net"

# Testar se realm convflow existe
try {
    $response = Invoke-RestMethod -Uri "$KEYCLOAK_URL/realms/convflow/.well-known/openid_configuration" -Method Get
    Write-Host "✅ Realm 'convflow' encontrado!" -ForegroundColor Green
    Write-Host "   Issuer: $($response.issuer)" -ForegroundColor White
    
    # Testar login
    Write-Host ""
    Write-Host "🔐 Testando login..." -ForegroundColor Yellow
    
    $tokenUrl = "$KEYCLOAK_URL/realms/convflow/protocol/openid-connect/token"
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
        Write-Host "   Token obtido com sucesso" -ForegroundColor White
        Write-Host ""
        Write-Host "✅ Keycloak está pronto para uso!" -ForegroundColor Green
        Write-Host "🚀 Inicie o frontend: cd frontend && npm run dev" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ Falha no login: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 Verifique:" -ForegroundColor Yellow
        Write-Host "   - Usuário 'test' existe e está ativo" -ForegroundColor White
        Write-Host "   - Senha é '123456' e não é temporária" -ForegroundColor White
        Write-Host "   - Client tem 'Direct access grants' habilitado" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Realm 'convflow' não encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Siga as instruções para criar o realm:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: $KEYCLOAK_URL/admin" -ForegroundColor Cyan
    Write-Host "   2. Crie realm 'convflow'" -ForegroundColor White
    Write-Host "   3. Configure client e usuário conforme instruções" -ForegroundColor White
}

Write-Host ""
