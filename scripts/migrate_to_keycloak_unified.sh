#!/bin/bash

echo "==================================================="
echo "ConvFlow - Script de Migracao para Keycloak Unificado"
echo "==================================================="
echo

echo "[1/6] Fazendo backup dos arquivos originais..."
mkdir -p src/backup/services
mkdir -p src/backup/routes
mkdir -p src/backup/models

cp src/main.py src/backup/main.py
cp src/services/auth_service.py src/backup/services/auth_service.py
cp src/routes/auth.py src/backup/routes/auth.py
cp src/models/auth.py src/backup/models/auth.py
cp src/services/keycloak_user_manager.py src/backup/services/keycloak_user_manager.py
cp src/routes/keycloak_users.py src/backup/routes/keycloak_users.py

echo "[2/6] Substituindo arquivos do backend para usar Keycloak centralizado..."
cp src/main_keycloak.py src/main.py
cp src/models/auth_keycloak.py src/models/auth.py 
cp src/routes/auth_keycloak.py src/routes/auth.py
cp src/services/auth_service_keycloak.py src/services/auth_service.py
cp src/services/keycloak_manager.py src/services/keycloak_user_manager.py
cp src/routes/keycloak_users_updated.py src/routes/keycloak_users.py

echo "[3/6] Verificando configuracoes do ambiente (.env)..."
echo "  Isso pode exigir revisao manual. Verifique se as variaveis VITE_KEYCLOAK_* estao corretas."

echo "[4/6] Reiniciando os servicos..."
echo "  Interrompendo servicos em execucao"
pkill -f "python.*src/main.py" || true
pkill -f "npm.*start" || true

echo "[5/6] Limpando caches..."
find . -name "__pycache__" -type d -exec rm -rf {} +;
find . -name "*.pyc" -delete

echo "[6/6] Migracao concluida!"
echo
echo "A migracao para autenticacao centralizada no Keycloak foi concluida."
echo "Agora toda a autenticacao e gerenciamento de usuarios e feita exclusivamente pelo Keycloak."
echo
echo "Para iniciar os servicos novamente, execute:"
echo "  ./start_services.sh"
echo

read -p "Pressione Enter para continuar..."
