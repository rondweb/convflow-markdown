@echo off
echo Starting FastAPI Backend Server...
cd /d "%~dp0..\.."
uv run python src/main.py
pause
