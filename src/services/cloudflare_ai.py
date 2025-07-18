"""
Cloudflare AI Service for image analysis and audio transcription.
"""
import os
import base64
import httpx
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class CloudflareAIService:
    """Service class for Cloudflare AI API interactions."""
    
    def __init__(self):
        self.account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
        self.api_token = os.getenv("CLOUDFLARE_API_TOKEN")
        self.base_url = os.getenv(
            "CLOUDFLARE_API_BASE", 
            "https://api.cloudflare.com/client/v4/accounts"
        )
        
        if not self.account_id or not self.api_token:
            logger.warning("Cloudflare AI credentials not configured. Image analysis and audio transcription will be limited.")
            self.enabled = False
        else:
            self.enabled = True
            logger.info("Cloudflare AI service initialized successfully")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for Cloudflare API requests."""
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
    
    async def analyze_image(self, image_data: bytes, prompt: str = None) -> Optional[str]:
        """
        Analyze an image using Cloudflare's ResNet-50 model.
        
        Args:
            image_data: Raw image bytes
            prompt: Optional prompt for analysis
            
        Returns:
            Analysis result as string, or None if failed
        """
        logger.info(f"Starting image analysis - enabled: {self.enabled}, data size: {len(image_data)} bytes")
        
        if not self.enabled:
            logger.warning("Cloudflare AI not enabled")
            return None
            
        try:
            # Encode image to base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Prepare the request using the correct AI run endpoint
            url = f"{self.base_url}/{self.account_id}/ai/run/@cf/microsoft/resnet-50"
            logger.info(f"Using Cloudflare AI URL: {url}")
            
            # ResNet-50 expects JSON payload with base64 encoded image
            payload = {
                "image": image_base64
            }
            
            logger.info(f"Sending JSON request to Cloudflare AI with base64 image size: {len(image_base64)} characters")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    headers=self._get_headers(),
                    json=payload
                )
                
                logger.info(f"Cloudflare response status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"Cloudflare response: {result}")
                    
                    # Extract classification results
                    if "result" in result:
                        classifications = result["result"]
                        
                        # Format the top classifications
                        analysis_parts = ["## Image Analysis"]
                        for i, classification in enumerate(classifications[:5]):  # Top 5
                            label = classification.get("label", "Unknown")
                            score = classification.get("score", 0)
                            analysis_parts.append(f"{i+1}. {label} (confidence: {score:.2%})")
                        
                        logger.info(f"Image analysis successful: {len(classifications)} classifications")
                        return "\n".join(analysis_parts)
                    
                    logger.warning("No 'result' key in response")
                    return "Image analyzed but no classifications returned"
                else:
                    logger.error(f"Cloudflare image analysis failed: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error analyzing image with Cloudflare AI: {e}")
            return None
    
    async def transcribe_audio(self, audio_data: bytes, language: str = "en") -> Optional[str]:
        """
        Transcribe audio using Cloudflare's Whisper model.
        
        Args:
            audio_data: Raw audio bytes
            language: Language code (default: "en")
            
        Returns:
            Transcription text, or None if failed
        """
        logger.info(f"Starting audio transcription - enabled: {self.enabled}, data size: {len(audio_data)} bytes")
        
        if not self.enabled:
            logger.warning("Cloudflare AI not enabled")
            return None
            
        try:
            # Prepare the request using the correct AI run endpoint
            url = f"{self.base_url}/{self.account_id}/ai/run/@cf/openai/whisper-large-v3-turbo"
            logger.info(f"Using Cloudflare AI URL: {url}")
            
            # Encode audio to base64 for Whisper
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            # Whisper expects JSON payload with base64 encoded audio
            payload = {
                "file": audio_base64
            }
            
            logger.info(f"Sending JSON request to Cloudflare AI with base64 audio size: {len(audio_base64)} characters")
            
            async with httpx.AsyncClient(timeout=60.0) as client:  # Longer timeout for audio
                response = await client.post(
                    url,
                    headers=self._get_headers(),
                    json=payload
                )
                
                logger.info(f"Cloudflare response status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"Cloudflare response: {result}")
                    
                    # Extract transcription
                    if "result" in result:
                        transcription_result = result["result"]
                        
                        # Handle different response formats
                        if isinstance(transcription_result, dict):
                            transcription = transcription_result.get("text", "").strip()
                        elif isinstance(transcription_result, str):
                            transcription = transcription_result.strip()
                        else:
                            transcription = str(transcription_result).strip()
                        
                        if transcription:
                            logger.info(f"Transcription successful: {transcription[:100]}...")
                            return f"## Audio Transcription\n{transcription}"
                        else:
                            logger.warning("No transcription text found in result")
                            return "## Audio Transcription\n[No speech detected]"
                    
                    logger.warning("No 'result' key in response")
                    return "Audio processed but no transcription returned"
                else:
                    logger.error(f"Cloudflare audio transcription failed: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error transcribing audio with Cloudflare AI: {e}")
            return None


# Global service instance
cloudflare_ai = CloudflareAIService()
