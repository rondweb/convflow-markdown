@echo off
echo ========================================
echo    ConvFlow - Starting Services
echo ========================================
echo.

cd /d "%~dp0"

REM Verificar se já existe uma instância rodando
echo Verificando instancias existentes...
netstat -ano | findstr ":5173" >nul
set FRONTEND_RUNNING=%errorlevel%
netstat -ano | findstr ":8000" >nul
set BACKEND_RUNNING=%errorlevel%

if %FRONTEND_RUNNING% == 0 (
    echo.
    echo ⚠️  AVISO: Ja existe um servidor frontend rodando na porta 5173
)
if %BACKEND_RUNNING% == 0 (
    echo.
    echo ⚠️  AVISO: Ja existe um servidor backend rodando na porta 8000
)

if %FRONTEND_RUNNING% == 0 (
    echo.
    choice /C YN /M "Deseja parar as instancias existentes e reiniciar"
    if errorlevel 2 (
        echo.
        echo ❌ Operacao cancelada. Use Ctrl+C para parar instancias manuais.
        pause
        exit /b
    )
    echo.
    echo 🛑 Parando instancias existentes...
    taskkill /F /IM node.exe 2>nul
    taskkill /F /IM python.exe 2>nul
    timeout /t 2 /nobreak >nul
)

echo [1/2] Starting FastAPI Backend (Port 8000)...
echo Backend provides Keycloak user management API and file conversion
echo.
start "ConvFlow Backend" cmd /k "uv run python src/main.py"
timeout /t 3 /nobreak >nul

echo [2/2] Starting React Frontend (Port 5173)...
echo Frontend uses Keycloak for authentication and backend API for operations
echo.
cd frontend
start "ConvFlow Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    Services Started Successfully!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Authentication: Keycloak (Centralized Auth)
echo API: FastAPI with Keycloak Integration
echo File Conversion: Azure API
echo.
echo ⚠️  IMPORTANTE: Nao execute este script novamente enquanto os servicos estiverem rodando
echo    Para parar: Feche as janelas dos servicos ou use Ctrl+C
echo.
echo Press any key to exit this window...
pause >nul
