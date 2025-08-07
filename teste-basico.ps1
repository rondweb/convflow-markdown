Write-Host "TESTE API PROGRAMATICA - KEYCLOAK" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$API_BASE = "http://localhost:8000"

# Teste 1: Verificar se API esta rodando
Write-Host "1. Verificando backend..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/health" -Method GET -TimeoutSec 5
    Write-Host "   OK: Backend esta rodando!" -ForegroundColor Green
}
catch {
    Write-Host "   ERRO: Backend nao acessivel" -ForegroundColor Red
    exit
}

# Teste 2: Criar usuario
Write-Host "2. Criando usuario teste..." -ForegroundColor Blue
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
        Write-Host "   OK: Usuario criado!" -ForegroundColor Green
        Write-Host "   ID: $($response.user_id)" -ForegroundColor Cyan
    }
    else {
        Write-Host "   ERRO: $($response.message)" -ForegroundColor Red
    }
}
catch {
    Write-Host "   ERRO na criacao" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Teste concluido!" -ForegroundColor Green
