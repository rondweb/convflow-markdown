@echo off
echo ========================================
echo    ConvFlow - Starting Services
echo ========================================
echo.

cd /d "%~dp0"

REM Verificar se já existe uma instância rodando
echo Verificando instancias existentes...
netstat -ano | findstr ":5173" >nul
if %errorlevel% == 0 (
    echo.
    echo ⚠️  AVISO: Ja existe um servidor rodando na porta 5173
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
    timeout /t 2 /nobreak >nul
)

echo [1/1] Starting React Frontend (Port 5173)...
echo Frontend uses Neon Auth for authentication and Azure API for file conversion
echo.
cd frontend
start "ConvFlow Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    Service Started Successfully!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo.
echo Authentication: Neon Auth (Stack Auth)
echo File Conversion: Azure API
echo.
echo ⚠️  IMPORTANTE: Nao execute este script novamente enquanto o frontend estiver rodando
echo    Para parar: Feche a janela do frontend ou use Ctrl+C
echo.
echo Press any key to exit this window...
pause >nul
