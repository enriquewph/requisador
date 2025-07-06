#!/bin/bash
echo "Starting Requisador de Requisitos..."
echo ""
echo "Open your browser and go to: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
cd src
python3 -m http.server 8000 2>/dev/null || python -m http.server 8000
