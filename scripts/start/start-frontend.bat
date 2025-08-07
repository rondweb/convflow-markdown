@echo off
echo.
echo ====================================
echo    INICIANDO FRONTEND CONVFLOW
echo ====================================
echo.

cd frontend

echo Verificando dependencias...
npm install

echo.
echo Iniciando servidor de desenvolvimento...
echo Frontend estara disponivel em: http://localhost:5173
echo.
echo Credenciais de teste:
echo Username: test
echo Password: 123456
echo.

npm run dev
