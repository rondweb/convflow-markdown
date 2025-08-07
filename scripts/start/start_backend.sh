#!/bin/bash
echo "Starting FastAPI Backend Server..."
cd "$(dirname "$0")/../.."
uv run python src/main.py
