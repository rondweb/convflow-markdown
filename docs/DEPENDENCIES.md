# ConvFlow Markdown API Dependencies

## Required Dependencies (Already Installed)

The following are already installed with the project:

### Core Dependencies
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `python-multipart` - File upload support
- `httpx` - HTTP client for Cloudflare AI API
- `python-dotenv` - Environment variable management

### Document Processing
- `markitdown[pptx,docx,xlsx,xls,pdf,outlook]` - Document conversion library with specific format support
- `python-pptx` - PowerPoint files (.pptx)
- `python-docx` - Word files (.docx)
- `openpyxl` - Excel files (.xlsx)
- `xlrd` - Older Excel files (.xls)
- `PyPDF2` or `pdfplumber` - PDF files
- `olefile` - Outlook messages (.msg)
- `beautifulsoup4` - HTML files
- `lxml` - XML processing

### AI Processing (Cloudflare)
- `httpx` - For making API calls to Cloudflare AI
- Cloudflare account with AI access

## Required Configuration

### Cloudflare AI Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
```

### Getting Cloudflare Credentials
1. **Account ID**: Found in your Cloudflare dashboard (right sidebar)
2. **API Token**: Create one at https://dash.cloudflare.com/profile/api-tokens
   - Use the "AI" template or create custom with AI permissions

## File Type Capabilities

### Documents (Full Support)
- **PowerPoint (.pptx)** - ✅ Full support
- **Word (.docx)** - ✅ Full support  
- **Excel (.xlsx, .xls)** - ✅ Full support
- **PDF (.pdf)** - ✅ Full support
- **Outlook (.msg)** - ✅ Full support
- **Text files (.txt, .md, .csv, .json, .xml, .html)** - ✅ Full support

### Media (AI-Powered)
- **Images (.jpg, .jpeg, .png, .gif, .bmp, .tiff)** - ✅ AI analysis via Cloudflare ResNet-50
- **Audio (.wav, .mp3, .m4a)** - ✅ AI transcription via Cloudflare Whisper

## Installation Commands

### Quick Setup
```bash
# Run the setup script
./setup.sh

# Or manually:
uv sync
cp .env.example .env
# Edit .env with your Cloudflare credentials
```

### Verify Installation
```bash
# Start the server
uv run python main.py

# Test basic functionality
curl http://localhost:8000/health

# Check AI status
curl http://localhost:8000/ai-status
```

## Environment Variables

```bash
# Required for AI features
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here

# Optional: Custom API endpoint (default: https://api.cloudflare.com/client/v4/accounts)
CLOUDFLARE_API_BASE=https://api.cloudflare.com/client/v4/accounts
```

## Migration from Previous Version

If you previously had ffmpeg/exiftool dependencies, they are no longer needed:

```bash
# Old approach (no longer needed)
# sudo apt-get install ffmpeg exiftool

# New approach (AI-powered)
# Just configure Cloudflare credentials in .env
```

## Current Status

- ✅ All Python dependencies installed
- ✅ Document conversion fully functional
- ✅ AI-powered image analysis (with Cloudflare credentials)
- ✅ AI-powered audio transcription (with Cloudflare credentials)
- ✅ No system dependencies required
