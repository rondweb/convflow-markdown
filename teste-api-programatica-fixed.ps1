# Teste API Programática - Keycloak User Management
Write-Host "🔧 TESTE API PROGRAMÁTICA - KEYCLOAK" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Este teste vai:" -ForegroundColor Yellow
Write-Host "   1. Verificar se sua API backend está rodando" -ForegroundColor White
Write-Host "   2. Testar criação de usuário via API" -ForegroundColor White
Write-Host "   3. Buscar o usuário criado" -ForegroundColor White
Write-Host "   4. Atribuir roles ao usuário" -ForegroundColor White
Write-Host ""

$API_BASE = "http://localhost:8000"
$SUCCESS_COUNT = 0
$TOTAL_TESTS = 4

# Teste 1: Verificar se API está rodando
Write-Host "1️⃣ Verificando se API backend está rodando..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/health" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Backend está rodando!" -ForegroundColor Green
    $SUCCESS_COUNT++
} catch {
    Write-Host "   ❌ Backend não está acessível" -ForegroundColor Red
    Write-Host "   🔧 Execute: uv run python src/main.py" -ForegroundColor Yellow
}

Write-Host ""

# Teste 2: Criar usuário via API
Write-Host "2️⃣ Testando criação de usuário..." -ForegroundColor Blue
$userData = @{
    username = "testuser"
    email = "testuser@example.com"
    firstName = "Test"
    lastName = "User"
    password = "123456"
} | ConvertTo-Json

try {
    $headers = @{ "Content-Type" = "application/json" }
    $response = Invoke-RestMethod -Uri "$API_BASE/api/users/create" -Method POST -Body $userData -Headers $headers -TimeoutSec 15
    
    if ($response.success) {
        Write-Host "   ✅ Usuário criado com sucesso!" -ForegroundColor Green
        Write-Host "   📋 ID do usuário: $($response.user_id)" -ForegroundColor Cyan
        $SUCCESS_COUNT++
        $CREATED_USER_ID = $response.user_id
    } else {
        Write-Host "   ❌ Erro ao criar usuário: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erro na requisição: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Teste 3: Buscar usuário criado
Write-Host "3️⃣ Buscando usuário criado..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/api/users/search/testuser" -Method GET -TimeoutSec 10
    
    if ($response.success) {
        Write-Host "   ✅ Usuário encontrado!" -ForegroundColor Green
        Write-Host "   📋 Username: $($response.user.username)" -ForegroundColor Cyan
        Write-Host "   📧 Email: $($response.user.email)" -ForegroundColor Cyan
        Write-Host "   👤 Nome: $($response.user.firstName) $($response.user.lastName)" -ForegroundColor Cyan
        $SUCCESS_COUNT++
    } else {
        Write-Host "   ❌ Usuário não encontrado: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erro na busca: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Teste 4: Atribuir role admin (se usuário foi criado)
Write-Host "4️⃣ Testando atribuição de role..." -ForegroundColor Blue
if ($CREATED_USER_ID) {
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/api/users/assign-role/$CREATED_USER_ID/admin" -Method POST -TimeoutSec 10
        
        if ($response.success) {
            Write-Host "   ✅ Role admin atribuída com sucesso!" -ForegroundColor Green
            $SUCCESS_COUNT++
        } else {
            Write-Host "   ❌ Erro ao atribuir role: $($response.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Erro na atribuição: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ⏭️ Pulando teste (usuário não foi criado)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================" -ForegroundColor Cyan
Write-Host "RESULTADO FINAL" -ForegroundColor White
Write-Host "==================" -ForegroundColor Cyan

$PERCENTAGE = [math]::Round(($SUCCESS_COUNT / $TOTAL_TESTS) * 100)

if ($SUCCESS_COUNT -eq $TOTAL_TESTS) {
    Write-Host "🎉 TODOS OS TESTES PASSARAM! ($SUCCESS_COUNT/$TOTAL_TESTS)" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ API Programática está funcionando perfeitamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Próximos passos:" -ForegroundColor Yellow
    Write-Host "   1. Integrar com frontend React" -ForegroundColor White
    Write-Host "   2. Criar interface administrativa" -ForegroundColor White
    Write-Host "   3. Adicionar validações e melhorias" -ForegroundColor White
    
} else {
    Write-Host "❌ API Programática teve problemas ($SUCCESS_COUNT/$TOTAL_TESTS testes passaram - $PERCENTAGE%)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Verifique:" -ForegroundColor Yellow
    Write-Host "   1. Backend está rodando (uv run python src/main.py)" -ForegroundColor White
    Write-Host "   2. Keycloak está acessível" -ForegroundColor White
    Write-Host "   3. Configurações do .env estão corretas" -ForegroundColor White
    Write-Host "   4. Client tem permissões de admin" -ForegroundColor White
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
