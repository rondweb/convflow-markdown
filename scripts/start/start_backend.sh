#!/bin/bash
echo "Starting FastAPI Backend Server..."
cd "$(dirname "$0")"
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
