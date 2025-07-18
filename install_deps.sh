#!/bin/bash

# ConvFlow Markdown - Setup Script
# This script sets up the environment for ConvFlow Markdown with Cloudflare AI integration

echo "Setting up ConvFlow Markdown environment..."

# Check if .env file exists
if [[ ! -f ".env" ]]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your Cloudflare credentials:"
    echo "   - CLOUDFLARE_ACCOUNT_ID"
    echo "   - CLOUDFLARE_API_TOKEN"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Install Python dependencies
echo "Installing Python dependencies..."
if command -v uv &> /dev/null; then
    uv sync
    echo "✅ Dependencies installed with uv"
elif command -v pip &> /dev/null; then
    pip install -r pyproject.toml
    echo "✅ Dependencies installed with pip"
else
    echo "❌ Neither uv nor pip found. Please install one of them first."
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Cloudflare credentials"
echo "2. Run the server: uv run python main.py"
echo "3. Test the API: curl http://localhost:8000/health"
echo ""
echo "Features enabled:"
echo "  - Document conversion (PDF, DOCX, PPTX, XLSX, etc.)"
echo "  - AI-powered image analysis (Cloudflare ResNet-50)"
echo "  - AI-powered audio transcription (Cloudflare Whisper)"
