# ConvFlow - Service Management

## 🚀 Starting Services

### Windows
```bash
start_services.bat
```

### Linux/macOS
```bash
chmod +x start_services.sh
./start_services.sh
```

## 🛑 Stopping Services

### Windows
```bash
stop_services.bat
```

### Linux/macOS
Press `Ctrl+C` in the terminal running the services, or:
```bash
# Find and kill processes
pkill -f "uvicorn src.main:app"
pkill -f "npm run dev"
```

## 🌐 Service URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🏗️ Architecture

- **Frontend** (React + Vite): User interface and file conversion
- **Backend** (FastAPI): Authentication and user management
- **Database**: Neon PostgreSQL (cloud)
- **File Conversion**: Azure API

## 📊 Service Flow

```
User Registration/Login:
Frontend → Backend (localhost:8000) → Neon PostgreSQL

File Conversion:
Frontend → Azure API → Converted Files
```

## 🔧 Requirements

### Backend
- Python 3.8+
- Dependencies in `pyproject.toml`
- Environment variables in `.env`

### Frontend
- Node.js 16+
- npm or yarn
- Dependencies in `package.json`

## 🔑 Environment Variables

Create `.env` file in root directory:
```env
NEON_CONNECTION_STRING=postgresql://...
JWT_SECRET_KEY=your-secret-key
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

## 🐛 Troubleshooting

### Backend not starting
- Check Python environment: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is available

### Frontend not starting
- Check Node.js: `node --version`
- Install dependencies: `npm install`
- Check port 5173 is available

### Database connection issues
- Verify `NEON_CONNECTION_STRING` in `.env`
- Check Neon PostgreSQL status
- Test connection: `python -c "import asyncpg; print('OK')"`
