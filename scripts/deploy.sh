#!/bin/bash

# ConvFlow Markdown API - Docker Build and Deploy Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="convflow-markdown"
TAG="latest"
COMPOSE_FILE="docker-compose.yml"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found!"
        print_status "Please create .env file with your Cloudflare credentials:"
        echo "CLOUDFLARE_ACCOUNT_ID=your_account_id"
        echo "CLOUDFLARE_API_TOKEN=your_api_token"
        exit 1
    fi
}

# Function to build Docker image
build_image() {
    print_status "Building Docker image: $IMAGE_NAME:$TAG"
    docker build -t "$IMAGE_NAME:$TAG" .
    print_status "Image built successfully!"
}

# Function to run with docker-compose
run_compose() {
    print_status "Starting services with docker-compose..."
    check_env
    docker-compose -f "$COMPOSE_FILE" up -d
    print_status "Services started!"
    print_status "API available at: http://localhost:8000"
    print_status "Health check: curl http://localhost:8000/health"
}

# Function to run with docker only
run_docker() {
    print_status "Starting container with Docker..."
    check_env
    source .env
    
    docker run -d \
        --name convflow-api \
        -p 8000:8000 \
        -e CLOUDFLARE_ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID" \
        -e CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" \
        --restart unless-stopped \
        "$IMAGE_NAME:$TAG"
    
    print_status "Container started!"
    print_status "API available at: http://localhost:8000"
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down 2>/dev/null || true
    docker stop convflow-api 2>/dev/null || true
    docker rm convflow-api 2>/dev/null || true
    print_status "Services stopped!"
}

# Function to show logs
show_logs() {
    if docker-compose ps | grep -q convflow-api; then
        docker-compose logs -f convflow-api
    elif docker ps | grep -q convflow-api; then
        docker logs -f convflow-api
    else
        print_error "No running containers found!"
    fi
}

# Function to show status
show_status() {
    print_status "=== Docker Containers ==="
    docker ps --filter "name=convflow" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    print_status "=== Health Check ==="
    if curl -s http://localhost:8000/health > /dev/null; then
        print_status "✅ API is healthy"
        curl -s http://localhost:8000/health | jq .
    else
        print_warning "❌ API is not responding"
    fi
    
    echo ""
    print_status "=== AI Status ==="
    if curl -s http://localhost:8000/ai-status > /dev/null; then
        curl -s http://localhost:8000/ai-status | jq .
    else
        print_warning "❌ AI status not available"
    fi
}

# Main script logic
case "$1" in
    "build")
        build_image
        ;;
    "start"|"up")
        build_image
        if [ "$2" = "compose" ]; then
            run_compose
        else
            run_docker
        fi
        ;;
    "stop"|"down")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        build_image
        run_compose
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "production")
        check_env
        print_status "Starting production deployment with nginx..."
        docker-compose --profile production up -d --build
        print_status "Production deployment started!"
        print_status "API available at: http://localhost:80"
        ;;
    *)
        echo "ConvFlow Markdown API - Docker Deployment"
        echo ""
        echo "Usage: $0 {build|start|stop|restart|logs|status|production}"
        echo ""
        echo "Commands:"
        echo "  build        - Build Docker image"
        echo "  start        - Build and start API (docker-compose)"
        echo "  start compose- Build and start with docker-compose"
        echo "  stop         - Stop all services"
        echo "  restart      - Restart all services"
        echo "  logs         - Show container logs"
        echo "  status       - Show service status and health"
        echo "  production   - Start production deployment with nginx"
        echo ""
        echo "Examples:"
        echo "  $0 start         # Start with docker-compose"
        echo "  $0 production    # Start with nginx proxy"
        echo "  $0 status        # Check if everything is working"
        exit 1
        ;;
esac
