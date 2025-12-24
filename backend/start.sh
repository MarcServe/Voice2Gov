#!/bin/bash
# Startup script for Railway/Render deployment

# Set default port if not provided
PORT=${PORT:-8000}

# Wait for database to be ready (optional, but helpful)
echo "Starting Voice2Gov Backend..."
echo "Port: $PORT"

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT

