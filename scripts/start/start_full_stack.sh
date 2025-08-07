#!/bin/bash

echo "========================================"
echo "    ConvFlow - Starting All Services"
echo "========================================"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if Python environment needs setup
if [ ! -f ".venv/bin/activate" ] && [ ! -f ".venv/pyvenv.cfg" ]; then
    echo "Setting up Python environment..."
    
    # Check if uv is available
    if command -v uv &> /dev/null; then
        echo "Using uv to setup environment..."
        uv sync
    elif command -v python3 &> /dev/null; then
        echo "Using python3 to setup environment..."
        python3 -m venv .venv
        source .venv/bin/activate
        pip install -r pyproject.toml 2>/dev/null || pip install fastapi uvicorn python-multipart requests python-dotenv
    else
        echo "Error: Neither uv nor python3 is available"
        exit 1
    fi
fi

echo "[1/2] Starting FastAPI Backend (Port 8000)..."
echo ""

# Start backend in background
if command -v uv &> /dev/null; then
    uv run python src/main.py &
else
    source .venv/bin/activate
    python src/main.py &
fi
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo "[2/2] Starting React Frontend (Port 5173)..."
echo "Frontend uses Keycloak for authentication and FastAPI backend for file conversion"
echo ""

cd frontend

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed or not in PATH"
    # Kill backend if frontend fails
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "    Services Started Successfully!"
echo "========================================"
echo ""
echo "Backend API: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Authentication: Keycloak (Centralized Auth)"
echo "File Conversion: FastAPI Backend + Azure AI"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to handle cleanup
cleanup() {
    echo ""
    echo "Stopping all services..."
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Stopping frontend..."
        kill $FRONTEND_PID 2>/dev/null
        wait $FRONTEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend..."
        kill $BACKEND_PID 2>/dev/null
        wait $BACKEND_PID 2>/dev/null
    fi
    
    echo "All services stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
