#!/bin/bash

echo "🎵 MusikkMeta Data Export"
echo "========================"

# Check if we're in the backend directory
if [ ! -f "export_music_data.py" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "Usage: cd backend && ./run_export.sh"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "Please ensure your .env file with database credentials is present"
    exit 1
fi

# Check for Python installation
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PIP_CMD="pip3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    PIP_CMD="pip"
else
    echo "❌ Error: Python not found. Please install Python 3.8+"
    exit 1
fi

echo "🐍 Using Python: $PYTHON_CMD"

# Install/update required dependencies
echo "📦 Installing dependencies..."
$PIP_CMD install pandas openpyxl asyncpg python-dotenv

# Load environment variables and run the export
echo "🚀 Starting data export..."
$PYTHON_CMD export_music_data.py

echo "✅ Export script completed"