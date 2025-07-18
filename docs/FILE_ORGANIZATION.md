# 📁 ConvFlow Markdown API - File Organization

This document explains the organized project structure after reorganization.

## 📂 Directory Structure

```
convflow-markdown/
├── 📄 README.md                  # Main project documentation
├── 📄 .env.example              # Environment configuration template
├── 📄 pyproject.toml           # Python project configuration
├── 📄 uv.lock                  # Dependency lock file
├── 📄 docker-compose.yml       # Docker Compose configuration
├── 📄 Dockerfile               # Docker image definition
├── 📄 nginx.conf               # Nginx proxy configuration
│
├── 📁 src/                      # 🎯 Main source code
│   ├── 📄 __init__.py
│   ├── 📄 main.py              # FastAPI application entry point
│   └── 📁 services/
│       ├── 📄 __init__.py
│       └── 📄 cloudflare_ai.py  # Cloudflare AI integration
│
├── 📁 docs/                     # 📚 Documentation
│   ├── 📄 PROJECT_STATUS.md     # Current project status
│   ├── 📄 DOCKER_DEPLOYMENT.md  # Docker deployment guide
│   ├── 📄 DEPENDENCIES.md       # Dependency information
│   └── 📄 CLEANUP_SUMMARY.md    # Project cleanup history
│
├── 📁 scripts/                  # 🔧 Utility scripts
│   └── 📄 deploy.sh             # Deployment automation script
│
└── 📁 .vscode/                  # VS Code configuration
    └── 📄 tasks.json            # VS Code tasks
```

## 🚀 Quick Actions

### Start Development Server
```bash
# Method 1: Using uv
uv run python src/main.py

# Method 2: Using VS Code
# Ctrl+Shift+P → "Tasks: Run Task" → "Run FastAPI Server"

# Method 3: Using uvicorn directly
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

### Docker Deployment
```bash
# Quick start
docker-compose up --build

# Production with nginx
./scripts/deploy.sh production

# Manual Docker
docker build -t convflow-markdown .
docker run -p 8000:8000 convflow-markdown
```

### Test the API
```bash
# Health check
curl http://localhost:8000/health

# AI status
curl http://localhost:8000/ai-status

# Upload a file
curl -X POST "http://localhost:8000/convert-file/" \
     -F "file=@example.pdf"
```

## 📋 Key Files

### Core Application
- **`src/main.py`** - Main FastAPI application with all endpoints
- **`src/services/cloudflare_ai.py`** - AI service integration (currently has issues)

### Configuration
- **`.env`** - Environment variables (create from `.env.example`)
- **`pyproject.toml`** - Python dependencies and project metadata
- **`docker-compose.yml`** - Docker services configuration

### Documentation
- **`README.md`** - Comprehensive project documentation
- **`docs/PROJECT_STATUS.md`** - Current feature status and known issues
- **`docs/DOCKER_DEPLOYMENT.md`** - Detailed Docker deployment guide

### Deployment
- **`Dockerfile`** - Container image definition
- **`scripts/deploy.sh`** - Automated deployment script
- **`nginx.conf`** - Reverse proxy configuration

## 🔧 Development Workflow

1. **Setup**: `uv sync` → `cp .env.example .env` → edit credentials
2. **Develop**: Run server → Make changes → Test endpoints
3. **Test**: Use Swagger UI at `http://localhost:8000/docs`
4. **Deploy**: `./scripts/deploy.sh production`

## 📊 Current Status

- ✅ **Document Conversion**: Fully working with 15+ formats
- ✅ **API Endpoints**: All endpoints functional
- ✅ **Docker Deployment**: Production ready
- ✅ **Documentation**: Comprehensive coverage
- 🚧 **AI Features**: Image/audio processing has API integration issues

## 🔍 Next Steps

1. **Fix AI Integration**: Debug Cloudflare Workers AI API calls
2. **Add Tests**: Create comprehensive test suite
3. **Performance**: Optimize for large file processing
4. **Features**: Add authentication and rate limiting

---

For detailed information, see the main [README.md](../README.md) or specific documentation in the `docs/` directory.
