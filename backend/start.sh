#!/bin/bash

# CorpFin360 ML Backend Startup Script

echo "🚀 Starting CorpFin360 ML Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create logs directory if it doesn't exist
mkdir -p logs

# Install Node.js dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Node.js dependencies"
        exit 1
    fi
    echo "✅ Node.js dependencies installed"
else
    echo "✅ Node.js dependencies already installed"
fi

# Install Python dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "🐍 Installing Python dependencies..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Python dependencies"
        exit 1
    fi
    echo "✅ Python dependencies installed"
else
    echo "⚠️  requirements.txt not found, skipping Python dependencies"
fi

# Check if ML models need training
if [ ! -d "ml/trained_models" ] || [ -z "$(ls -A ml/trained_models 2>/dev/null)" ]; then
    echo "🤖 Training ML models..."
    python3 ml/train_models.py
    if [ $? -ne 0 ]; then
        echo "❌ Failed to train ML models"
        exit 1
    fi
    echo "✅ ML models trained successfully"
else
    echo "✅ ML models already trained"
fi

# Set environment variables if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating environment configuration..."
    cp env.example .env
    echo "✅ Environment configuration created from template"
    echo "⚠️  Please edit .env file with your configuration before starting"
fi

# Start the server
echo "🌐 Starting Express server..."
echo "📊 Backend will be available at http://localhost:5000"
echo "🔍 Health check: http://localhost:5000/health"
echo "📝 Press Ctrl+C to stop the server"
echo ""

npm run dev
