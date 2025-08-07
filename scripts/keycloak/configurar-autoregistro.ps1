# Configurar Autoregistro no Keycloak
Write-Host "🔧 CONFIGURAÇÃO DE AUTOREGISTRO" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Para habilitar autoregistro no Keycloak:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1️⃣ Acesse o Admin Console:" -ForegroundColor White
Write-Host "   https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net/admin" -ForegroundColor Cyan
Write-Host ""

Write-Host "2️⃣ Vá para Realm Settings:" -ForegroundColor White
Write-Host "   • No realm 'convflow', clique em 'Realm Settings'" -ForegroundColor Gray
Write-Host "   • Aba 'Login'" -ForegroundColor Gray
Write-Host "   • Habilite 'User registration' ✅" -ForegroundColor Gray
Write-Host "   • Habilite 'Forgot password' ✅ (opcional)" -ForegroundColor Gray
Write-Host "   • Habilite 'Remember me' ✅ (opcional)" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣ Configurar Email (para confirmação):" -ForegroundColor White
Write-Host "   • Aba 'Email'" -ForegroundColor Gray
Write-Host "   • Configure SMTP server (Gmail, SendGrid, etc.)" -ForegroundColor Gray
Write-Host "   • Teste envio de email" -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣ Configurar verificação de email:" -ForegroundColor White
Write-Host "   • Aba 'Login'" -ForegroundColor Gray
Write-Host "   • Habilite 'Verify email' ✅" -ForegroundColor Gray
Write-Host "   • Habilite 'Login with email' ✅" -ForegroundColor Gray
Write-Host ""

Write-Host "🎯 RESULTADO:" -ForegroundColor Yellow
Write-Host "   • Usuários poderão se cadastrar em: /realms/convflow/protocol/openid-connect/registrations" -ForegroundColor White
Write-Host "   • Link aparecerá na tela de login" -ForegroundColor White
Write-Host "   • Email de confirmação será enviado" -ForegroundColor White
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
