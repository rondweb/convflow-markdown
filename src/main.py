from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
import tempfile
import os
import sys
from markitdown import MarkItDown
import logging
from dotenv import load_dotenv

# Add the project root to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.cloudflare_ai import cloudflare_ai

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ConvFlow Markdown API",
    description="Convert various file formats to markdown",
    version="1.0.0"
)

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
    'txt': 'Text files',
    'html': 'HTML files',
    'htm': 'HTML files',
    'xml': 'XML files',
    'json': 'JSON files',
    'csv': 'CSV files',
    'zip': 'ZIP archives',
    'py': 'Python files',
    'js': 'JavaScript files',
    'md': 'Markdown files'
}

# File size limits (in bytes) - adjusted for nginx defaults
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB per file (nginx friendly)
MAX_TOTAL_SIZE = 20 * 1024 * 1024  # 20MB total

# File type categories
IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'}
AUDIO_EXTENSIONS = {'wav', 'mp3', 'm4a', 'mp4'}

async def process_media_file(content: bytes, file_extension: str, filename: str) -> Dict[str, Any]:
    """
    Process media files (images and audio) with Cloudflare AI.
    
    Args:
        content: File content as bytes
        file_extension: File extension (without dot)
        filename: Original filename
        
    Returns:
        Dictionary with processing results
    """
    result = {
        "filename": filename,
        "file_type": SUPPORTED_EXTENSIONS.get(file_extension, "Unknown"),
        "markdown": "",
        "success": True,
        "cloudflare_ai_used": False
    }
    
    try:
        # First, try MarkItDown for basic metadata
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            # Get basic metadata from MarkItDown
            md_result = md_converter.convert(tmp_path)
            basic_markdown = md_result.text_content if hasattr(md_result, 'text_content') else str(md_result)
            result["markdown"] = basic_markdown
        except Exception as e:
            logger.warning(f"MarkItDown processing failed for {filename}: {e}")
            result["markdown"] = f"# {filename}\n\nFile processed but metadata extraction failed."
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
        
        # Enhanced processing with Cloudflare AI
        if file_extension in IMAGE_EXTENSIONS:
            # Image analysis
            ai_analysis = await cloudflare_ai.analyze_image(content)
            if ai_analysis:
                result["markdown"] += f"\n\n{ai_analysis}"
                result["cloudflare_ai_used"] = True
            else:
                result["markdown"] += "\n\n## Image Analysis\nCloudflare AI analysis not available (check configuration)"
                
        elif file_extension in AUDIO_EXTENSIONS:
            # Audio transcription
            ai_transcription = await cloudflare_ai.transcribe_audio(content)
            if ai_transcription:
                result["markdown"] += f"\n\n{ai_transcription}"
                result["cloudflare_ai_used"] = True
            else:
                result["markdown"] += "\n\n## Audio Transcription\nCloudflare AI transcription not available (check configuration)"
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing media file {filename}: {e}")
        result["success"] = False
        result["error"] = str(e)
        return result

@app.get("/")
async def root():
    return {
        "message": "ConvFlow Markdown API",
        "supported_formats": SUPPORTED_EXTENSIONS,
        "endpoints": {
            "convert": "/convert-to-markdown/",
            "convert_single": "/convert-file/",
            "health": "/health",
            "ai_status": "/ai-status",
            "supported_formats": "/supported-formats/"
        },
        "ai_features": {
            "image_analysis": "Cloudflare ResNet-50",
            "audio_transcription": "Cloudflare Whisper Large V3 Turbo"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "convflow-markdown"}

@app.get("/ai-status")
async def ai_status():
    """Check Cloudflare AI service status."""
    return {
        "cloudflare_ai_enabled": cloudflare_ai.enabled,
        "account_id_configured": bool(cloudflare_ai.account_id),
        "api_token_configured": bool(cloudflare_ai.api_token),
        "supported_features": {
            "image_analysis": cloudflare_ai.enabled,
            "audio_transcription": cloudflare_ai.enabled
        }
    }

@app.post("/convert-to-markdown/")
async def convert_multiple_files_to_markdown(
    files: List[UploadFile] = File(...)
) -> JSONResponse:
    """
    Convert multiple files to markdown format.
    
    Supports: pptx, docx, xlsx, xls, pdf, outlook messages, audio files, and more.
    Returns JSON with filename as key and markdown content as value.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    results = {}
    errors = {}
    total_size = 0
    
    for file in files:
        try:
            # Validate file
            if not file.filename:
                errors[f"unnamed_file_{len(errors)}"] = "File has no name"
                continue
                
            filename = file.filename
            file_extension = filename.split('.')[-1].lower() if '.' in filename else ''
            
            if file_extension not in SUPPORTED_EXTENSIONS:
                errors[filename] = f"Unsupported file type: {file_extension}"
                continue
            
            # Read file content
            content = await file.read()
            if not content:
                errors[filename] = "File is empty"
                continue
            
            # Check file size limits
            file_size = len(content)
            if file_size > MAX_FILE_SIZE:
                errors[filename] = f"File too large: {file_size / (1024*1024):.1f}MB (max {MAX_FILE_SIZE / (1024*1024):.0f}MB)"
                continue
            
            total_size += file_size
            if total_size > MAX_TOTAL_SIZE:
                errors[filename] = f"Total upload size too large: {total_size / (1024*1024):.1f}MB (max {MAX_TOTAL_SIZE / (1024*1024):.0f}MB)"
                continue
            
            # Create temporary file and convert
            if file_extension in IMAGE_EXTENSIONS or file_extension in AUDIO_EXTENSIONS:
                # Use Cloudflare AI for media files
                media_result = await process_media_file(content, file_extension, filename)
                if media_result["success"]:
                    results[filename] = {
                        "markdown": media_result["markdown"],
                        "file_type": media_result["file_type"],
                        "success": True,
                        "cloudflare_ai_used": media_result["cloudflare_ai_used"]
                    }
                else:
                    errors[filename] = media_result.get("error", "Media processing failed")
            else:
                # Use MarkItDown for document files
                with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as tmp_file:
                    tmp_file.write(content)
                    tmp_path = tmp_file.name
                
                try:
                    # Convert to markdown using MarkItDown
                    result = md_converter.convert(tmp_path)
                    markdown_content = result.text_content if hasattr(result, 'text_content') else str(result)
                    
                    results[filename] = {
                        "markdown": markdown_content,
                        "file_type": SUPPORTED_EXTENSIONS.get(file_extension, "Unknown"),
                        "success": True,
                        "cloudflare_ai_used": False
                    }
                    
                except Exception as convert_error:
                    errors[filename] = f"Conversion error: {str(convert_error)}"
                    logger.error(f"Error converting {filename}: {convert_error}")
                
                finally:
                    # Clean up temporary file
                    if os.path.exists(tmp_path):
                        os.unlink(tmp_path)
                    
        except Exception as e:
            error_key = file.filename if file.filename else f"unnamed_file_{len(errors)}"
            errors[error_key] = f"Processing error: {str(e)}"
            logger.error(f"Error processing file {error_key}: {e}")
    
    response_data = {
        "results": results,
        "total_files": len(files),
        "successful_conversions": len(results),
        "failed_conversions": len(errors)
    }
    
    if errors:
        response_data["errors"] = errors
    
    return JSONResponse(content=response_data)

@app.post("/convert-file/")
async def convert_single_file_to_markdown(
    file: UploadFile = File(...)
) -> JSONResponse:
    """
    Convert a single file to markdown format.
    
    Supports: pptx, docx, xlsx, xls, pdf, outlook messages, audio files, and more.
    Returns JSON with markdown content.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="File has no name")
    
    filename = file.filename
    file_extension = filename.split('.')[-1].lower() if '.' in filename else ''
    
    if file_extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {file_extension}. Supported types: {list(SUPPORTED_EXTENSIONS.keys())}"
        )
    
    try:
        # Read file content
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Check file size
        file_size = len(content)
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413, 
                detail=f"File too large: {file_size / (1024*1024):.1f}MB (max {MAX_FILE_SIZE / (1024*1024):.0f}MB)"
            )
        
        # Process the file
        if file_extension in IMAGE_EXTENSIONS or file_extension in AUDIO_EXTENSIONS:
            # Use Cloudflare AI for media files
            media_result = await process_media_file(content, file_extension, filename)
            if media_result["success"]:
                response_data = {
                    "filename": filename,
                    "file_type": media_result["file_type"],
                    "markdown": media_result["markdown"],
                    "success": True,
                    "cloudflare_ai_used": media_result["cloudflare_ai_used"]
                }
                return JSONResponse(content=response_data)
            else:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Media processing error: {media_result.get('error', 'Unknown error')}"
                )
        else:
            # Use MarkItDown for document files
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as tmp_file:
                tmp_file.write(content)
                tmp_path = tmp_file.name
            
            try:
                # Convert to markdown using MarkItDown
                result = md_converter.convert(tmp_path)
                markdown_content = result.text_content if hasattr(result, 'text_content') else str(result)
                
                response_data = {
                    "filename": filename,
                    "file_type": SUPPORTED_EXTENSIONS.get(file_extension, "Unknown"),
                    "markdown": markdown_content,
                    "success": True,
                    "cloudflare_ai_used": False
                }
                
                return JSONResponse(content=response_data)
                
            except Exception as convert_error:
                logger.error(f"Error converting {filename}: {convert_error}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Conversion error: {str(convert_error)}"
                )
            
            finally:
                # Clean up temporary file
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing file {filename}: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Processing error: {str(e)}"
        )

@app.get("/supported-formats/")
async def get_supported_formats():
    """Get list of supported file formats."""
    return {
        "supported_formats": SUPPORTED_EXTENSIONS,
        "total_supported": len(SUPPORTED_EXTENSIONS)
    }

def main():
    """Run the FastAPI server."""
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        limit_max_requests=1000,
        limit_concurrency=100,
        timeout_keep_alive=30,
        # Increase file upload limits
        # Note: For production, consider using nginx to handle large files
    )

if __name__ == "__main__":
    main()
