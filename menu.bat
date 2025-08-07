@echo off
echo ========================================
echo     ConvFlow - Menu de Scripts
echo ========================================
echo.

:menu
echo Escolha uma opcao:
echo.
echo [SERVICOS]
echo 1. Iniciar todos os servicos
echo 2. Verificar status dos servicos
echo 3. Parar todos os servicos
echo.
echo [TESTES]
echo 4. Teste API Programatica Keycloak
echo 5. Teste basico de conectividade
echo 6. Teste completo do sistema
echo.
echo [SETUP]
echo 7. Setup completo do Keycloak
echo 8. Preparar frontend
echo 9. Criar usuario teste no Keycloak
echo.
echo [OUTROS]
echo 10. Abrir documentacao da API
echo 11. Abrir frontend no navegador
echo 0. Sair
echo.
set /p choice="Digite sua escolha (0-11): "

if "%choice%"=="1" goto start_services
if "%choice%"=="2" goto check_services
if "%choice%"=="3" goto stop_services
if "%choice%"=="4" goto test_api
if "%choice%"=="5" goto test_basic
if "%choice%"=="6" goto test_complete
if "%choice%"=="7" goto setup_keycloak
if "%choice%"=="8" goto setup_frontend
if "%choice%"=="9" goto create_user
if "%choice%"=="10" goto open_docs
if "%choice%"=="11" goto open_frontend
if "%choice%"=="0" goto exit
echo Opcao invalida!
goto menu

:start_services
echo Iniciando servicos...
call scripts\start\start_services.bat
goto menu

:check_services
echo Verificando servicos...
call scripts\start\check_services.bat
goto menu

:stop_services
echo Parando servicos...
call scripts\start\stop_services.bat
goto menu

:test_api
echo Executando teste da API...
powershell -ExecutionPolicy Bypass -File scripts\tests\teste-basico.ps1
pause
goto menu

:test_basic
echo Executando teste basico...
powershell -ExecutionPolicy Bypass -File scripts\tests\teste-basico.ps1
pause
goto menu

:test_complete
echo Executando teste completo...
powershell -ExecutionPolicy Bypass -File scripts\tests\teste-final.ps1
pause
goto menu

:setup_keycloak
echo Configurando Keycloak...
powershell -ExecutionPolicy Bypass -File scripts\setup\setup-keycloak-complete.ps1
pause
goto menu

:setup_frontend
echo Preparando frontend...
powershell -ExecutionPolicy Bypass -File scripts\setup\preparar-frontend.ps1
pause
goto menu

:create_user
echo Criando usuario teste...
powershell -ExecutionPolicy Bypass -File scripts\keycloak\create-test-user.ps1
pause
goto menu

:open_docs
echo Abrindo documentacao da API...
start http://localhost:8000/docs
goto menu

:open_frontend
echo Abrindo frontend...
start http://localhost:5173
goto menu

:exit
echo Saindo...
exit /b 0
