#!/bin/bash

echo "Making scripts executable..."
chmod +x start_services.sh
chmod +x start_full_stack.sh
chmod +x deploy.sh 2>/dev/null || true
chmod +x scripts/deploy.sh 2>/dev/null || true

echo "✅ Scripts are now executable"
echo ""
echo "Available commands:"
echo "  ./start_services.sh     - Start only frontend (recommended for development)"
echo "  ./start_full_stack.sh   - Start backend + frontend (full stack)"
echo ""
echo "To start the development environment:"
echo "  ./start_services.sh"
