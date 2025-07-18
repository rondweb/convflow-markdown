#!/usr/bin/env python3
"""
Simple test script to verify Cloudflare AI functionality directly
"""
import asyncio
import sys
import os
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

from src.services.cloudflare_ai import cloudflare_ai

async def test_audio_transcription():
    """Test audio transcription with a small sample"""
    print("Testing Cloudflare AI audio transcription...")
    print(f"Enabled: {cloudflare_ai.enabled}")
    print(f"Account ID configured: {bool(cloudflare_ai.account_id)}")
    print(f"API Token configured: {bool(cloudflare_ai.api_token)}")
    
    # Create a dummy audio data (just for testing the API call)
    dummy_audio = b"dummy audio data for testing" * 100  # Small test data
    
    result = await cloudflare_ai.transcribe_audio(dummy_audio)
    print(f"Result: {result}")
    
    return result

if __name__ == "__main__":
    asyncio.run(test_audio_transcription())
