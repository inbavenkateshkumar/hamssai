@echo off
REM Holy Angels Substitution Server - Quick Start
REM This batch file will automatically start the server from the correct directory

echo.
echo ═══════════════════════════════════════════════════════════
echo          Holy Angels Substitution System
echo ═══════════════════════════════════════════════════════════
echo.

REM Get the directory where this batch file is located
cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo ✅ Starting server...
echo.
echo 📱 Access your application at:
echo    - Local:   http://localhost:3000
echo    - Network: http://192.168.43.231:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
node server.js

REM If server crashes, pause to see the error
if errorlevel 1 (
    echo.
    echo ❌ Server failed to start. See error above.
    pause
    exit /b 1
)
