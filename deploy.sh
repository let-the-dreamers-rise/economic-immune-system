#!/bin/bash

# 🚀 Quick Google Cloud Deployment Script

echo "🚀 Deploying Agentic Finance Backend to Google Cloud..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "🔐 Please authenticate with Google Cloud:"
    gcloud auth login
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project set. Please set your project:"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Project: $PROJECT_ID"

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable appengine.googleapis.com --quiet
gcloud services enable cloudbuild.googleapis.com --quiet

# Build backend
echo "🔨 Building backend..."
npm run build:backend

if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi

# Deploy to App Engine
echo "🚀 Deploying to Google App Engine..."
gcloud app deploy app.yaml --quiet

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your backend is now live at:"
    gcloud app browse --no-launch-browser
    echo ""
    echo "🔍 Health check:"
    BACKEND_URL=$(gcloud app browse --no-launch-browser)
    echo "$BACKEND_URL/api/health"
    echo ""
    echo "📊 Immune status:"
    echo "$BACKEND_URL/api/immune-status"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update your frontend vite.config.ts with the new backend URL"
    echo "2. Test all API endpoints"
    echo "3. Monitor logs: gcloud app logs tail -s default"
else
    echo "❌ Deployment failed!"
    exit 1
fi