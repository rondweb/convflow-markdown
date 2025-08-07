Write-Host "🔧 TESTE API PROGRAMÁTICA - KEYCLOAK" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$API_BASE = "http://localhost:8000"

# Teste 1: Verificar se API está rodando
Write-Host "1️⃣ Verificando backend..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/health" -Method GET -TimeoutSec 5
    Write-Host "   ✅ Backend está rodando!" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Backend não acessível" -ForegroundColor Red
    exit
}

# Teste 2: Criar usuário
Write-Host "2️⃣ Criando usuário teste..." -ForegroundColor Blue
$userData = @{
    username = "testuser"
    email = "testuser@example.com"
    firstName = "Test"
    lastName = "User"
    password = "123456"
}

$json = $userData | ConvertTo-Json
$headers = @{ "Content-Type" = "application/json" }

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/api/users/create" -Method POST -Body $json -Headers $headers -TimeoutSec 10
    
    if ($response.success) {
        Write-Host "   ✅ Usuário criado!" -ForegroundColor Green
        Write-Host "   ID: $($response.user_id)" -ForegroundColor Cyan
    }
    else {
        Write-Host "   ❌ Erro: $($response.message)" -ForegroundColor Red
    }
}
catch {
    Write-Host "   ❌ Erro na criação" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Teste concluído!" -ForegroundColor Green
