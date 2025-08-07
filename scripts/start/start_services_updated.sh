#!/bin/bash

echo "========================================"
echo "    ConvFlow - Starting Services"
echo "========================================"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "[1/1] Starting React Frontend (Port 5173)..."
echo "Frontend uses Neon Auth for authentication and Azure API for file conversion"
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
echo "Authentication: Neon Auth (Stack Auth)"
echo "File Conversion: Azure API"
echo ""
echo "Press Ctrl+C to stop the service"

# Function to handle cleanup
cleanup() {
    echo ""
    echo "Stopping frontend service..."
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        wait $FRONTEND_PID 2>/dev/null
    fi
    echo "Service stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for the frontend process
wait $FRONTEND_PID
