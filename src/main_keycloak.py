from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional
import tempfile
import os
import sys
from markitdown import MarkItDown
import logging
from dotenv import load_dotenv

# Add the project root to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.cloudflare_ai import cloudflare_ai
from src.routes.auth_keycloak import router as auth_router, get_current_user_optional
from src.routes.keycloak_users_updated import router as keycloak_users_router
from src.models.auth_keycloak import User

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security scheme for optional authentication
security = HTTPBearer(auto_error=False)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting ConvFlow API...")
    yield
    # Shutdown
    logger.info("Shutting down ConvFlow API...")


app = FastAPI(
    title="ConvFlow Markdown API",
    description="Convert various file formats to markdown with Keycloak authentication",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication and user routes
app.include_router(auth_router)
app.include_router(keycloak_users_router)

# Initialize MarkItDown converter
md_converter = MarkItDown()

# Supported file extensions
SUPPORTED_EXTENSIONS = {
    'pptx': 'PowerPoint files',
    'docx': 'Word files', 
    'xlsx': 'Excel files',
    'xls': 'Older Excel files',
    'pdf': 'PDF files',
    'msg': 'Outlook messages',
    'wav': 'Audio files (transcription)',
    'mp3': 'Audio files (transcription)',
    'm4a': 'Audio files (transcription)',
    'jpg': 'JPEG images',
    'jpeg': 'JPEG images',
    'png': 'PNG images',
    'gif': 'GIF images',
    'bmp': 'BMP images',
    'tiff': 'TIFF images',
    'webp': 'WebP images',
}

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "ConvFlow API is running"}

@app.get("/api/supported-formats")
async def supported_formats():
    """Return list of supported file formats"""
    return {
        "formats": SUPPORTED_EXTENSIONS
    }

@app.post("/api/convert")
async def convert_file(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
    authorization: Optional[str] = Header(None)
):
    """
    Convert uploaded file to markdown
    
    - Requires Keycloak authentication token in the Authorization header
    - File will be processed based on its extension
    - Returns markdown content and any extracted metadata
    """
    # Check if authenticated
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required for file conversion"
        )
    
    # Check file extension
    file_extension = file.filename.split('.')[-1].lower() if file.filename else ''
    
    if file_extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format: .{file_extension}"
        )
    
    # Create temp file to save the uploaded file
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as tmp_file:
        # Read uploaded file content
        content = await file.read()
        tmp_file.write(content)
        tmp_file_path = tmp_file.name
    
    try:
        # Convert file to markdown using MarkItDown
        result = md_converter.convert(tmp_file_path)
        
        # Add to usage tracking
        # Removed database usage tracking and using only Keycloak
        
        # Return the converted markdown and metadata
        return {
            "success": True,
            "markdown": result.markdown,
            "metadata": result.metadata,
            "original_filename": file.filename,
            "size": len(content)
        }
        
    except Exception as e:
        logger.error(f"Conversion error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error converting file: {str(e)}"
        )
        
    finally:
        # Clean up the temp file
        try:
            os.unlink(tmp_file_path)
        except Exception as e:
            logger.error(f"Error removing temp file: {str(e)}")

@app.post("/api/ai/process")
async def process_with_ai(
    request: Dict[str, Any],
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Process text with Cloudflare AI
    
    - Requires Keycloak authentication
    - Send text for AI processing
    - Returns AI-processed result
    """
    # Check if authenticated
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required for AI processing"
        )
    
    if "text" not in request:
        raise HTTPException(
            status_code=400,
            detail="Text field is required"
        )
    
    text = request["text"]
    operation = request.get("operation", "summarize")
    
    try:
        # Process with Cloudflare AI
        result = cloudflare_ai.process_text(text, operation)
        
        return {
            "success": True,
            "result": result,
            "operation": operation
        }
        
    except Exception as e:
        logger.error(f"AI processing error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing with AI: {str(e)}"
        )
