@echo off
echo Starting FastAPI Backend Server...
cd /d "%~dp0"
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
pause
