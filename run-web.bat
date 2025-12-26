@echo off
REM AURA HCM - Web Application Launcher
REM This script starts the Next.js web application

echo ========================================
echo AURA HCM - Web Application
echo ========================================
echo.

REM Change to the web app directory
cd /d "%~dp0apps\web"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Dependencies not found. Installing...
    echo.
    call npm install --legacy-peer-deps
    echo.
)

REM Start the development server
echo [INFO] Starting Next.js development server...
echo [INFO] The application will be available at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
