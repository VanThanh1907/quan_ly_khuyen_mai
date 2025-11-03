@echo off
title Promotion Management System
color 0A

echo ========================================
echo   PROMOTION MANAGEMENT SYSTEM
echo   Starting All Services...
echo ========================================
echo.

REM Check if MongoDB is running
echo [1/5] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is running
) else (
    echo [WARNING] MongoDB is NOT running!
    echo.
    echo MongoDB is REQUIRED to run this application.
    echo.
    echo Please start MongoDB using ONE of these methods:
    echo   1. Open MongoDB Compass
    echo   2. Run 'mongod' in a new terminal
    echo   3. Start MongoDB service
    echo.
    echo After starting MongoDB, press any key to continue...
    pause >nul
    echo.
    echo Testing MongoDB connection...
    cd backend
    node testConnection.js
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Cannot connect to MongoDB!
        echo Please fix MongoDB connection and try again.
        pause
        exit /b 1
    )
    cd ..
)
echo.

REM Check if node_modules exist
echo [2/5] Checking dependencies...
if not exist "backend\node_modules\" (
    echo [INFO] Backend dependencies not found
    echo [INFO] Running setup first...
    call setup.bat
    echo.
) else (
    echo [OK] Backend dependencies found
)

if not exist "frontend\node_modules\" (
    echo [INFO] Frontend dependencies not found
    echo [INFO] Running setup first...
    call setup.bat
    echo.
) else (
    echo [OK] Frontend dependencies found
)
echo.

REM Kill existing processes on ports 5000 and 3000
echo [3/5] Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>NUL
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>NUL
echo [OK] Ports cleared
echo.

REM Start Backend
echo [4/5] Starting Backend Server...
start "Backend - Port 5000" cmd /k "cd /d %~dp0backend && echo ======================================== && echo   Backend Server Starting... && echo ======================================== && echo. && npm run dev"
echo [OK] Backend starting on http://localhost:5000
timeout /t 5 /nobreak >nul
echo.

REM Start Frontend
echo [5/5] Starting Frontend Application...
start "Frontend - Port 3000" cmd /k "cd /d %~dp0frontend && echo ======================================== && echo   Frontend Server Starting... && echo ======================================== && echo. && npm start"
echo [OK] Frontend starting on http://localhost:3000
echo.

REM Wait and open browsers
echo ========================================
echo   Waiting for servers to start...
echo ========================================
timeout /t 10 /nobreak >nul

echo.
echo Opening applications in browser...
timeout /t 5 /nobreak >nul

REM Open Backend API docs
start http://localhost:5000/api/promotions

REM Open Frontend
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo   ALL SERVICES STARTED!
echo ========================================
echo.
echo   Backend API:  http://localhost:5000
echo   Frontend UI:  http://localhost:3000
echo.
echo   Test Accounts:
echo   -----------------------------------
echo   Admin: admin / admin123
echo   User:  user  / user123
echo   -----------------------------------
echo.
echo   Two command windows will open:
echo   - Backend Server (keep running)
echo   - Frontend Server (keep running)
echo.
echo   Press any key to STOP all servers...
pause >nul

echo.
echo Stopping all servers...
taskkill /F /FI "WindowTitle eq Backend*" 2>NUL
taskkill /F /FI "WindowTitle eq Frontend*" 2>NUL
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>NUL
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>NUL

echo.
echo ========================================
echo   All servers stopped!
echo ========================================
echo.
pause