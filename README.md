# ConvFlow Markdown API

A powerful FastAPI-based service that converts various file formats to markdown, with AI-powered enhancements for images and audio files.

## � ATUALIZAÇÃO IMPORTANTE: Autenticação Centralizada com Keycloak

Agora utilizamos o **Keycloak** como sistema centralizado de autenticação e gerenciamento de usuários. Para migrar para a nova implementação:

```bash
# Windows
scripts\migrate_to_keycloak_unified.bat

# Linux
./scripts/migrate_to_keycloak_unified.sh
```

Para documentação detalhada sobre a nova autenticação, consulte [docs/KEYCLOAK_CENTRALIZED_AUTH.md](docs/KEYCLOAK_CENTRALIZED_AUTH.md).

## �🚀 Features

### Document Conversion (✅ Working)
- **PowerPoint** (.pptx) → Markdown with slide content
- **Word Documents** (.docx) → Structured markdown
- **Excel Spreadsheets** (.xlsx, .xls) → Table format
- **PDF Files** (.pdf) → Text extraction
- **Outlook Messages** (.msg) → Email content
- **Text Files** (.txt, .md, .html, .xml, .json, .csv) → Formatted content
- **Code Files** (.py, .js) → Syntax-preserved markdown
- **ZIP Archives** (.zip) → Content listing and extraction### AI-Powered Media Processing (🚧 In Development)- **Image Analysis** (.jpg, .jpeg, .png, .gif, .bmp, .tiff) → Object classification using Cloudflare ResNet-50- **Audio Transcription** (.wav, .mp3, .m4a, .mp4) → Speech-to-text using Cloudflare Whisper> **Note:** Image analysis and audio transcription features are currently experiencing API integration issues and are under active development.## 📋 Table of Contents- [Quick Start](#-quick-start)- [Installation](#-installation)- [API Documentation](#-api-documentation)- [Docker Deployment](#-docker-deployment)- [Configuration](#-configuration)- [File Size Limits](#-file-size-limits)- [Supported Formats](#-supported-formats)- [Development](#-development)- [Troubleshooting](#-troubleshooting)- [Contributing](#-contributing)## 🚀 Quick Start### Prerequisites- Python 3.12+- [uv](https://github.com/astral-sh/uv) (recommended) or pip- Cloudflare account with AI access (for image/audio features)### Local Development```bash# Clone the repositorygit clone https://github.com/yourusername/convflow-markdown.gitcd convflow-markdown# Install dependenciesuv sync# Set up environment variablescp .env.example .env# Edit .env with your Cloudflare credentials (optional for document conversion)# Run the serveruv run python src/main.py# Or use VS Code task: Ctrl+Shift+P → "Tasks: Run Task" → "Run FastAPI Server"```The API will be available at `http://localhost:8000`### Docker Quick Start```bash# Build and run with Docker Composedocker-compose up --build# Or use the deployment scriptchmod +x scripts/deploy.sh./scripts/deploy.sh start```## 📦 Installation### Method 1: Using uv (Recommended)```bash# Install uv if you haven't alreadycurl -LsSf https://astral.sh/uv/install.sh | sh# Clone and installgit clone https://github.com/yourusername/convflow-markdown.gitcd convflow-markdownuv sync```### Method 2: Using pip```bashgit clone https://github.com/yourusername/convflow-markdown.gitcd convflow-markdownpip install -r requirements.txt  # Generate this with: uv export --format requirements-txt```### Method 3: Docker```bashgit clone https://github.com/yourusername/convflow-markdown.gitcd convflow-markdowndocker-compose up --build```## 📚 API Documentation### Interactive DocumentationOnce the server is running, visit:- **Swagger UI**: `http://localhost:8000/docs`- **ReDoc**: `http://localhost:8000/redoc`### Core Endpoints#### Single File Conversion```bashPOST /convert-file/Content-Type: multipart/form-datacurl -X POST "http://localhost:8000/convert-file/" \     -H "accept: application/json" \     -H "Content-Type: multipart/form-data" \     -F "file=@document.pdf"```#### Multiple Files Conversion```bashPOST /convert-to-markdown/Content-Type: multipart/form-datacurl -X POST "http://localhost:8000/convert-to-markdown/" \     -H "accept: application/json" \     -H "Content-Type: multipart/form-data" \     -F "files=@doc1.pdf" \     -F "files=@doc2.docx" \     -F "files=@image.jpg"```#### System Status```bash# Health checkGET /health# AI features statusGET /ai-status# Supported formatsGET /supported-formats/# API informationGET /```### Response Format```json{  "filename": "document.pdf",  "file_type": "PDF files",  "markdown": "# Document Title\n\nContent here...",  "success": true,  "cloudflare_ai_used": false}```## 🐳 Docker Deployment### Development```bash# Start development environmentdocker-compose up --build# View logsdocker-compose logs -f convflow-api```### Production```bash# Start with nginx proxy./scripts/deploy.sh production# Or manuallydocker-compose --profile production up -d --build```### Docker Commands```bash# Build imagedocker build -t convflow-markdown .# Run containerdocker run -d \  --name convflow-api \  -p 8000:8000 \  -e CLOUDFLARE_ACCOUNT_ID=your_id \  -e CLOUDFLARE_API_TOKEN=your_token \  convflow-markdown# View logsdocker logs -f convflow-api# Stop and removedocker stop convflow-api && docker rm convflow-api```For detailed Docker deployment instructions, see [docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md).## ⚙️ Configuration### Environment VariablesCreate a `.env` file in the project root:```env# Required for AI features (image analysis & audio transcription)CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_idCLOUDFLARE_API_TOKEN=your_cloudflare_api_token# OptionalCLOUDFLARE_API_BASE=https://api.cloudflare.com/client/v4/accountsLOG_LEVEL=INFO```
### Getting Cloudflare Credentials

1. Sign up at [Cloudflare](https://cloudflare.com)
2. Go to [AI Dashboard](https://dash.cloudflare.com/ai)
3. Get your Account ID from the sidebar
4. Create an API token with AI permissions

## 📏 File Size Limits

Current limits (configurable in `src/main.py`):

- **Single file**: 5MB
- **Total upload**: 20MB
- **Nginx proxy**: 100MB (in Docker deployment)

### Increasing Limits

1. **Application limits**: Edit `MAX_FILE_SIZE` and `MAX_TOTAL_SIZE` in `src/main.py`
2. **Nginx limits**: Update `client_max_body_size` in `nginx.conf`
3. **Docker limits**: Restart containers after changes

## 📁 Supported Formats

### ✅ Document Formats (Fully Working)

| Category | Extensions | Description | Powered By |
|----------|------------|-------------|------------|
| **Presentations** | `.pptx` | PowerPoint slides | MarkItDown |
| **Documents** | `.docx` | Word documents | MarkItDown |
| **Spreadsheets** | `.xlsx`, `.xls` | Excel files | MarkItDown |
| **PDFs** | `.pdf` | Portable documents | MarkItDown |
| **Email** | `.msg` | Outlook messages | MarkItDown |
| **Text** | `.txt`, `.md`, `.html`, `.htm` | Plain text and markup | MarkItDown |
| **Data** | `.xml`, `.json`, `.csv` | Structured data | MarkItDown |
| **Code** | `.py`, `.js` | Source code | MarkItDown |
| **Archives** | `.zip` | Compressed files | MarkItDown |

### 🚧 Media Formats (In Development)

| Category | Extensions | Description | Status | Powered By |
|----------|------------|-------------|--------|------------|
| **Images** | `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff` | Object classification | ⚠️ API Issues | Cloudflare ResNet-50 |
| **Audio** | `.wav`, `.mp3`, `.m4a`, `.mp4` | Speech transcription | ⚠️ API Issues | Cloudflare Whisper |

> **Current Issues with AI Features:**
> - Image analysis: API integration issues with Cloudflare ResNet-50
> - Audio transcription: Payload format conflicts with Cloudflare Whisper API
> - Working on resolution - document conversion works perfectly

## 🛠️ Development

### Project Structure

```
convflow-markdown/
├── src/                          # Source code
│   ├── main.py                   # FastAPI application
│   └── services/                 # Service modules
│       └── cloudflare_ai.py      # Cloudflare AI integration
├── docs/                         # Documentation
│   ├── DOCKER_DEPLOYMENT.md     # Docker deployment guide
│   ├── DEPENDENCIES.md          # Dependency information
│   └── CLEANUP_SUMMARY.md       # Cleanup history
├── scripts/                      # Utility scripts
│   └── deploy.sh                 # Deployment script
├── .vscode/                      # VS Code configuration
├── docker-compose.yml           # Docker Compose config
├── Dockerfile                   # Docker image definition
├── nginx.conf                   # Nginx configuration
├── pyproject.toml               # Python project config
└── README.md                    # This file
```

### Local Development Setup

```bash
# Install dependencies
uv sync

# Run in development mode
uv run python src/main.py

# Or with auto-reload
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

# Run tests (when available)
uv run pytest

# Format code
uv run black src/
uv run isort src/
```

### VS Code Integration

This project includes VS Code tasks:
- **Run FastAPI Server**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Run FastAPI Server"

### Adding New File Formats

1. Add the extension to `SUPPORTED_EXTENSIONS` in `src/main.py`
2. Ensure MarkItDown supports the format
3. Test the conversion
4. Update documentation

### Extending AI Features

1. Add new service methods in `src/services/cloudflare_ai.py`
2. Update the processing logic in `process_media_file()`
3. Test with appropriate file types
4. Update API documentation

## 🔧 Troubleshooting

### Common Issues

#### 1. **413 Request Entity Too Large**
```bash
# Solution: Increase file size limits
# Edit MAX_FILE_SIZE in src/main.py
# Update client_max_body_size in nginx.conf
```

#### 2. **Cloudflare AI Not Working**
```bash
# Check configuration
curl http://localhost:8000/ai-status

# Verify environment variables
echo $CLOUDFLARE_ACCOUNT_ID
echo $CLOUDFLARE_API_TOKEN
```

#### 3. **Port Already in Use**
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9

# Or use different port
uv run uvicorn src.main:app --host 0.0.0.0 --port 8001
```

#### 4. **Docker Build Fails**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### 5. **Import Errors After Restructuring**
```bash
# Ensure Python path includes src/
export PYTHONPATH="${PYTHONPATH}:/path/to/project"

# Or run from project root
cd /path/to/convflow-markdown
uv run python src/main.py
```

### Debug Mode

Enable debug logging:
```python
# In src/main.py
logging.basicConfig(level=logging.DEBUG)
```

### Health Checks

```bash
# Basic health
curl http://localhost:8000/health

# AI status
curl http://localhost:8000/ai-status

# Test conversion
curl -X POST "http://localhost:8000/convert-file/" \
     -F "file=@test.txt"
```

## 📈 Performance Optimization

### For High Load

1. **Increase worker processes**:
   ```bash
   uv run uvicorn src.main:app --workers 4
   ```

2. **Use nginx for load balancing**:
   ```bash
   ./scripts/deploy.sh production
   ```

3. **Configure resource limits**:
   ```yaml
   # docker-compose.yml
   services:
     convflow-api:
       deploy:
         resources:
           limits:
             memory: 1G
             cpus: '1.0'
   ```

### File Processing Optimization

- Large files are processed in temporary storage
- Automatic cleanup after processing
- Streaming support for large uploads
- Configurable timeout settings

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **File Validation**: Only accepted file types are processed
3. **Size Limits**: Configurable upload limits prevent abuse
4. **Temporary Files**: Automatic cleanup prevents disk filling
5. **Docker Security**: Non-root user in containers
6. **API Rate Limiting**: Consider adding rate limiting for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- Follow PEP 8 style guidelines
- Add type hints where possible
- Update tests for new features
- Document API changes
- Test Docker deployment

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[MarkItDown](https://github.com/microsoft/markitdown)** - Microsoft's excellent document conversion library
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework for building APIs
- **[Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)** - AI model API services
- **[uv](https://github.com/astral-sh/uv)** - Fast Python package installer and resolver

## 📞 Support

- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: [GitHub Issues](https://github.com/yourusername/convflow-markdown/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/convflow-markdown/discussions)

---

**Made with ❤️ for document conversion and AI-powered content processing**