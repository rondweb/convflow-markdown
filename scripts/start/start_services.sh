#!/bin/bash

echo "========================================"
echo "    ConvFlow - Starting Services"
echo "========================================"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if services are already running
echo "Verificando instancias existentes..."
FRONTEND_RUNNING=$(lsof -ti:5173)
BACKEND_RUNNING=$(lsof -ti:8000)

if [ ! -z "$FRONTEND_RUNNING" ]; then
    echo "⚠️  AVISO: Ja existe um servidor frontend rodando na porta 5173"
fi

if [ ! -z "$BACKEND_RUNNING" ]; then
    echo "⚠️  AVISO: Ja existe um servidor backend rodando na porta 8000"
fi

if [ ! -z "$FRONTEND_RUNNING" ] || [ ! -z "$BACKEND_RUNNING" ]; then
    echo ""
    read -p "Deseja parar as instancias existentes e reiniciar? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operacao cancelada. Use Ctrl+C para parar instancias manuais."
        exit 1
    fi
    echo ""
    echo "🛑 Parando instancias existentes..."
    [ ! -z "$FRONTEND_RUNNING" ] && kill -9 $FRONTEND_RUNNING 2>/dev/null
    [ ! -z "$BACKEND_RUNNING" ] && kill -9 $BACKEND_RUNNING 2>/dev/null
    sleep 2
fi

echo "[1/2] Starting FastAPI Backend (Port 8000)..."
echo "Backend provides Keycloak user management API and file conversion"
echo ""

# Start backend
if command -v uv &> /dev/null; then
    uv run python src/main.py &
else
    python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 &
fi
BACKEND_PID=$!
sleep 3

echo "[2/2] Starting React Frontend (Port 5173)..."
echo "Frontend uses Keycloak for authentication and backend API for operations"
echo ""

cd frontend

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed or not in PATH"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start frontend
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "    Service Started Successfully!"
echo "========================================"
echo ""
echo "Frontend: http://localhost:5173"
echo ""
echo "Authentication: Keycloak (Centralized Auth)"
echo "File Conversion: Azure API"
echo ""
echo "Press Ctrl+C to stop the service"

# Function to handle cleanup
cleanup() {
    echo ""
    echo "Stopping services..."
    [ ! -z "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null
    [ ! -z "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null
    echo "Services stopped."
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

echo ""
echo "========================================"
echo "    Services Started Successfully!"
echo "========================================"
echo ""
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Authentication: Keycloak (Centralized Auth)"
echo "API: FastAPI with Keycloak Integration"
echo "File Conversion: Azure API"
echo ""
echo "Press Ctrl+C to stop the services"

# Wait for background processes
wait
