@echo off
echo ========================================
echo    ConvFlow - Stopping Services
echo ========================================
echo.

echo 🛑 Parando serviços ConvFlow...

echo Parando frontend (Port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Parando backend (Port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM Parar todos os processos Node.js extras
taskkill /F /IM node.exe 2>nul

echo.
echo Verificando portas...
netstat -ano | findstr ":5173" >nul
if %errorlevel% == 0 (
    echo ⚠️  Porta 5173 ainda em uso
) else (
    echo ✅ Porta 5173 liberada
)

netstat -ano | findstr ":8000" >nul
if %errorlevel% == 0 (
    echo ⚠️  Porta 8000 ainda em uso
) else (
    echo ✅ Porta 8000 liberada
)

echo.
echo ========================================
echo    Serviços parados com sucesso!
echo ========================================
echo.
pause
