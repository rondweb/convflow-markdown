@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo ConvFlow - Script de Migracao para Keycloak Unificado
echo ===================================================
echo.

echo [1/6] Fazendo backup dos arquivos originais...
if not exist "src\backup" mkdir "src\backup"
if not exist "src\backup\services" mkdir "src\backup\services"
if not exist "src\backup\routes" mkdir "src\backup\routes"
if not exist "src\backup\models" mkdir "src\backup\models"

copy "src\main.py" "src\backup\main.py"
copy "src\services\auth_service.py" "src\backup\services\auth_service.py"
copy "src\routes\auth.py" "src\backup\routes\auth.py"
copy "src\models\auth.py" "src\backup\models\auth.py"
copy "src\services\keycloak_user_manager.py" "src\backup\services\keycloak_user_manager.py"
copy "src\routes\keycloak_users.py" "src\backup\routes\keycloak_users.py"

echo [2/6] Substituindo arquivos do backend para usar Keycloak centralizado...
copy "src\main_keycloak.py" "src\main.py"
copy "src\models\auth_keycloak.py" "src\models\auth.py" 
copy "src\routes\auth_keycloak.py" "src\routes\auth.py"
copy "src\services\auth_service_keycloak.py" "src\services\auth_service.py"
copy "src\services\keycloak_manager.py" "src\services\keycloak_user_manager.py"
copy "src\routes\keycloak_users_updated.py" "src\routes\keycloak_users.py"

echo [3/6] Verificando configuracoes do ambiente (.env)...
echo   Isso pode exigir revisao manual. Verifique se as variaveis VITE_KEYCLOAK_* estao corretas.

echo [4/6] Reiniciando os servicos...
echo   Interrompendo servicos em execucao
taskkill /F /IM python.exe /FI "WINDOWTITLE eq ConvFlow*" >nul 2>&1
taskkill /F /IM npm.cmd /FI "WINDOWTITLE eq ConvFlow*" >nul 2>&1

echo [5/6] Limpando caches...
if exist "__pycache__" rmdir /S /Q "__pycache__"
if exist "src\__pycache__" rmdir /S /Q "src\__pycache__"

echo [6/6] Migracao concluida!
echo.
echo A migracao para autenticacao centralizada no Keycloak foi concluida.
echo Agora toda a autenticacao e gerenciamento de usuarios e feita exclusivamente pelo Keycloak.
echo.
echo Para iniciar os servicos novamente, execute:
echo   start_services.bat
echo.

pause
