#!/bin/bash

# Script para inicializar o backend FastAPI no Linux
echo "Starting FastAPI Backend Server on Linux..."

# Verificar se Python3 está instalado
if ! command -v python3 &> /dev/null; then
    echo "Python3 não encontrado. Por favor, instale Python3:"
    echo "sudo apt update && sudo apt install python3 python3-pip python3-venv"
    exit 1
fi

# Verificar se pip está instalado
if ! command -v pip3 &> /dev/null; then
    echo "pip3 não encontrado. Instalando..."
    sudo apt install python3-pip
fi

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "Ativando ambiente virtual..."
source venv/bin/activate

# Atualizar pip
echo "Atualizando pip..."
pip install --upgrade pip

# Instalar dependências
echo "Instalando dependências..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "Instalando dependências básicas..."
    pip install fastapi uvicorn python-multipart python-dotenv
fi

# Iniciar servidor
echo "Iniciando servidor FastAPI..."
cd src
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

echo "Servidor iniciado em http://localhost:8000"
