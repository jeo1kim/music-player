#!/bin/bash
# Simple script to serve the web upload interface

PORT=8000

echo "Starting web server on http://localhost:$PORT"
echo "Open http://localhost:$PORT in your browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Try Python first (most common)
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m http.server $PORT
# Try Node.js http-server if available
elif command -v npx &> /dev/null; then
    npx http-server -p $PORT
else
    echo "Error: No web server found. Please install Python 3 or Node.js"
    exit 1
fi

