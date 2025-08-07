# Teste da API Programática - Keycloak
Write-Host "🔧 TESTE API PROGRAMÁTICA - KEYCLOAK" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Este teste vai:" -ForegroundColor Yellow
Write-Host "   1. Verificar se sua API backend está rodando" -ForegroundColor White
Write-Host "   2. Testar criação de usuário via API" -ForegroundColor White
Write-Host "   3. Buscar o usuário criado" -ForegroundColor White
Write-Host "   4. Atribuir roles ao usuário" -ForegroundColor White
Write-Host ""

# Configurações
$API_BASE = "http://localhost:8000"  # Sua API FastAPI
$TEST_USER_DATA = @{
    username = "api_test_user"
    email = "apitest@convflow.com"
    firstName = "API"
    lastName = "Test User"
    password = "senha123"
}

# 1. Verificar se a API está rodando
Write-Host "1️⃣ Verificando se API backend está rodando..." -ForegroundColor White

try {
    $healthCheck = Invoke-RestMethod -Uri "$API_BASE/docs" -Method Get -TimeoutSec 5
    Write-Host "   ✅ API backend está rodando" -ForegroundColor Green
} catch {
    Write-Host "   ❌ API backend não está rodando" -ForegroundColor Red
    Write-Host "   📋 Para iniciar: python src/main.py" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Finalizando teste..." -ForegroundColor Gray
    exit
}

Write-Host ""
Write-Host "2️⃣ Testando criação de usuário..." -ForegroundColor White

try {
    $createResponse = Invoke-RestMethod -Uri "$API_BASE/api/users/create" -Method Post -Body ($TEST_USER_DATA | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 10
    
    if ($createResponse.success) {
        Write-Host "   ✅ Usuário criado com sucesso!" -ForegroundColor Green
        Write-Host "   📋 User ID: $($createResponse.user_id)" -ForegroundColor Cyan
        Write-Host "   📋 Username: $($TEST_USER_DATA.username)" -ForegroundColor Cyan
        
        $userId = $createResponse.user_id
        
    } else {
        Write-Host "   ❌ Falha ao criar usuário: $($createResponse.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "   ❌ Erro ao chamar API de criação: $($_.Exception.Message)" -ForegroundColor Red
    
    # Verificar se pode ser erro de usuário já existente
    if ($_.Exception.Message -like "*already exists*" -or $_.Exception.Message -like "*409*") {
        Write-Host "   💡 Usuário pode já existir. Tentando buscar..." -ForegroundColor Yellow
        
        try {
            $searchResponse = Invoke-RestMethod -Uri "$API_BASE/api/users/search/$($TEST_USER_DATA.username)" -Method Get -TimeoutSec 10
            
            if ($searchResponse.success) {
                Write-Host "   ✅ Usuário encontrado (já existia)" -ForegroundColor Green
                $userId = $searchResponse.user.id
            }
            
        } catch {
            Write-Host "   ❌ Não foi possível buscar usuário existente" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "3️⃣ Testando busca de usuário..." -ForegroundColor White

if ($userId) {
    try {
        $searchResponse = Invoke-RestMethod -Uri "$API_BASE/api/users/search/$($TEST_USER_DATA.username)" -Method Get -TimeoutSec 10
        
        if ($searchResponse.success) {
            Write-Host "   ✅ Usuário encontrado!" -ForegroundColor Green
            Write-Host "   📋 ID: $($searchResponse.user.id)" -ForegroundColor Cyan
            Write-Host "   📋 Username: $($searchResponse.user.username)" -ForegroundColor Cyan
            Write-Host "   📋 Email: $($searchResponse.user.email)" -ForegroundColor Cyan
            Write-Host "   📋 Nome: $($searchResponse.user.firstName) $($searchResponse.user.lastName)" -ForegroundColor Cyan
            Write-Host "   📋 Ativo: $($searchResponse.user.enabled)" -ForegroundColor Cyan
            Write-Host "   📋 Email verificado: $($searchResponse.user.emailVerified)" -ForegroundColor Cyan
        } else {
            Write-Host "   ❌ Usuário não encontrado na busca" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "   ❌ Erro ao buscar usuário: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "4️⃣ Testando atribuição de role..." -ForegroundColor White

if ($userId) {
    try {
        $roleResponse = Invoke-RestMethod -Uri "$API_BASE/api/users/assign-role/$userId/admin" -Method Post -TimeoutSec 10
        
        if ($roleResponse.success) {
            Write-Host "   ✅ Role 'admin' atribuída com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Falha ao atribuir role (pode não existir): $($roleResponse.message)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "   ⚠️  Erro ao atribuir role: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   💡 Role 'admin' pode não existir no realm" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🎯 RESUMO DO TESTE" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Cyan

if ($userId) {
    Write-Host "✅ API Programática está FUNCIONANDO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Usuário de teste criado:" -ForegroundColor Cyan
    Write-Host "   Username: $($TEST_USER_DATA.username)" -ForegroundColor White
    Write-Host "   Email: $($TEST_USER_DATA.email)" -ForegroundColor White
    Write-Host "   Senha: $($TEST_USER_DATA.password)" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Próximos passos:" -ForegroundColor Yellow
    Write-Host "   1. Integrar com frontend React" -ForegroundColor White
    Write-Host "   2. Criar interface administrativa" -ForegroundColor White
    Write-Host "   3. Adicionar validações e melhorias" -ForegroundColor White
    
} else {
    Write-Host "❌ API Programática teve problemas" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Verifique:" -ForegroundColor Yellow
    Write-Host "   1. Backend está rodando (python src/main.py)" -ForegroundColor White
    Write-Host "   2. Keycloak está acessível" -ForegroundColor White
    Write-Host "   3. Configurações do .env estão corretas" -ForegroundColor White
    Write-Host "   4. Client tem permissões de admin" -ForegroundColor White
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
