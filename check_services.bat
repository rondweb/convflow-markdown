@echo off
echo ========================================
echo    ConvFlow - Verificacao de Servicos
echo ========================================
echo.

echo Verificando Backend (porta 8000)...
curl -s -o nul -w "%%{http_code}" "http://localhost:8000/health" > temp_result.txt
set /p BACKEND_STATUS=<temp_result.txt
del temp_result.txt

if "%BACKEND_STATUS%" == "200" (
    echo ✅ Backend: ONLINE ^(HTTP %BACKEND_STATUS%^)
) else (
    echo ❌ Backend: OFFLINE ou com problemas ^(HTTP %BACKEND_STATUS%^)
)

echo.
echo Verificando Frontend (porta 5173)...
curl -s -o nul -w "%%{http_code}" "http://localhost:5173" > temp_result.txt
set /p FRONTEND_STATUS=<temp_result.txt
del temp_result.txt

if "%FRONTEND_STATUS%" == "200" (
    echo ✅ Frontend: ONLINE ^(HTTP %FRONTEND_STATUS%^)
) else (
    echo ❌ Frontend: OFFLINE ou com problemas ^(HTTP %FRONTEND_STATUS%^)
)

echo.
echo ========================================
if "%BACKEND_STATUS%" == "200" if "%FRONTEND_STATUS%" == "200" (
    echo Status: TODOS OS SERVICOS ONLINE ✅
    echo.
    echo Backend API: http://localhost:8000
    echo Frontend Web: http://localhost:5173
    echo API Documentation: http://localhost:8000/docs
) else (
    echo Status: ALGUNS SERVICOS COM PROBLEMAS ❌
    echo.
    echo Para iniciar os servicos:
    echo   start_services.bat
)
echo ========================================
echo.
pause
