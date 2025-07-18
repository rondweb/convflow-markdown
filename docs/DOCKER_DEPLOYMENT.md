# ConvFlow Markdown API - Docker Deployment

This guide covers how to deploy the ConvFlow Markdown API using Docker.

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Clone the repository
git clone <your-repo-url>
cd convflow-markdown

# Copy environment variables
cp .env.example .env
# Edit .env with your Cloudflare credentials

# Build and start the service
docker-compose up --build
```

The API will be available at `http://localhost:8000`

### 2. Build and Run with Docker Only

```bash
# Build the image
docker build -t convflow-markdown .

# Run the container
docker run -d \
  --name convflow-api \
  -p 8000:8000 \
  -e CLOUDFLARE_ACCOUNT_ID=your_account_id \
  -e CLOUDFLARE_API_TOKEN=your_api_token \
  convflow-markdown
```

## Environment Variables

Required environment variables:

```bash
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

Optional environment variables:

```bash
LOG_LEVEL=INFO
CLOUDFLARE_API_BASE=https://api.cloudflare.com/client/v4/accounts
```

## Production Deployment

### With Nginx (Recommended)

```bash
# Start with nginx proxy
docker-compose --profile production up -d
```

This will:
- Start the API on port 8000 (internal)
- Start nginx on ports 80 and 443
- Handle SSL termination and load balancing
- Increase file upload limits to 100MB

### SSL Configuration

For production with SSL, mount your certificates:

```yaml
# Add to docker-compose.yml nginx service
volumes:
  - ./nginx.conf:/etc/nginx/nginx.conf:ro
  - ./ssl/cert.pem:/etc/ssl/certs/cert.pem:ro
  - ./ssl/key.pem:/etc/ssl/private/key.pem:ro
```

## API Endpoints

Once deployed, the following endpoints are available:

- `GET /` - API information and supported formats
- `GET /health` - Health check
- `GET /ai-status` - Cloudflare AI configuration status
- `POST /convert-file/` - Convert single file to markdown
- `POST /convert-to-markdown/` - Convert multiple files to markdown
- `GET /docs` - Swagger UI documentation
- `GET /redoc` - ReDoc documentation

## Monitoring

### Health Checks

The container includes health checks:

```bash
# Check container health
docker ps

# Manual health check
curl http://localhost:8000/health
```

### Logs

```bash
# View logs
docker-compose logs -f convflow-api

# View nginx logs (if using nginx)
docker-compose logs -f nginx
```

## File Upload Limits

Current limits:
- Single file: 5MB
- Total upload: 20MB
- Nginx proxy: 100MB

To change limits, update:
1. `MAX_FILE_SIZE` and `MAX_TOTAL_SIZE` in `main.py`
2. `client_max_body_size` in `nginx.conf`

## Supported File Formats

### Documents (MarkItDown)
- PowerPoint (.pptx)
- Word (.docx)
- Excel (.xlsx, .xls)
- PDF (.pdf)
- Outlook (.msg)
- Text files (.txt, .md, .html, .xml, .json, .csv)
- Code files (.py, .js)
- Archives (.zip)

### Media (Cloudflare AI)
- Images: .jpg, .jpeg, .png, .gif, .bmp, .tiff (ResNet-50 analysis)
- Audio: .wav, .mp3, .m4a, .mp4 (Whisper transcription)

## Troubleshooting

### Common Issues

1. **413 Request Entity Too Large**
   ```bash
   # Increase nginx limits
   client_max_body_size 200M;
   ```

2. **Cloudflare AI not working**
   ```bash
   # Check AI status
   curl http://localhost:8000/ai-status
   
   # Verify environment variables
   docker exec convflow-api env | grep CLOUDFLARE
   ```

3. **Container won't start**
   ```bash
   # Check logs
   docker-compose logs convflow-api
   
   # Check port conflicts
   docker ps
   netstat -tulpn | grep :8000
   ```

### Performance Tuning

For high load environments:

```yaml
# docker-compose.yml
services:
  convflow-api:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          memory: 512M
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Use Docker secrets in production
3. **Network**: Use internal networks for service communication
4. **Updates**: Regularly update base images and dependencies
5. **Logging**: Avoid logging sensitive data

## Development

For development with hot reload:

```yaml
# docker-compose.override.yml
services:
  convflow-api:
    volumes:
      - .:/app
    command: ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

Then run:
```bash
docker-compose up
```
