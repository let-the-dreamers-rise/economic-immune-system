@echo off
REM 🚀 Quick Google Cloud Deployment Script for Windows

echo 🚀 Deploying Agentic Finance Backend to Google Cloud...

REM Check if gcloud is installed
gcloud --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Google Cloud CLI not found. Please install it first:
    echo    https://cloud.google.com/sdk/docs/install
    exit /b 1
)

REM Check if user is authenticated
for /f %%i in ('gcloud auth list --filter=status:ACTIVE --format="value(account)"') do set ACCOUNT=%%i
if "%ACCOUNT%"=="" (
    echo 🔐 Please authenticate with Google Cloud:
    gcloud auth login
)

REM Get current project
for /f %%i in ('gcloud config get-value project') do set PROJECT_ID=%%i
if "%PROJECT_ID%"=="" (
    echo ❌ No project set. Please set your project:
    echo    gcloud config set project YOUR_PROJECT_ID
    exit /b 1
)

echo 📋 Project: %PROJECT_ID%

REM Enable required APIs
echo 🔧 Enabling required APIs...
gcloud services enable appengine.googleapis.com --quiet
gcloud services enable cloudbuild.googleapis.com --quiet

REM Build backend
echo 🔨 Building backend...
npm run build:backend

if %errorlevel% neq 0 (
    echo ❌ Backend build failed!
    exit /b 1
)

REM Deploy to App Engine
echo 🚀 Deploying to Google App Engine...
gcloud app deploy app.yaml --quiet

if %errorlevel% equ 0 (
    echo ✅ Deployment successful!
    echo.
    echo 🌐 Your backend is now live at:
    gcloud app browse --no-launch-browser
    echo.
    echo 🔍 Health check: [YOUR_URL]/api/health
    echo 📊 Immune status: [YOUR_URL]/api/immune-status
    echo.
    echo 📝 Next steps:
    echo 1. Update your frontend vite.config.ts with the new backend URL
    echo 2. Test all API endpoints
    echo 3. Monitor logs: gcloud app logs tail -s default
) else (
    echo ❌ Deployment failed!
    exit /b 1
)