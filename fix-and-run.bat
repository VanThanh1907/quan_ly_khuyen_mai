@echo off
title Fix and Run - Promotion Management
color 0A

echo ========================================
echo   FIXING AND RUNNING APPLICATION
echo ========================================
echo.

REM Check MongoDB
echo [1/7] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is running
) else (
    echo [WARNING] MongoDB NOT running!
    echo Please open MongoDB Compass or run: mongod
    echo.
    echo Press any key to continue...
    pause >nul
)
echo.

REM Clean Frontend
echo [2/7] Cleaning Frontend...
cd frontend
if exist node_modules (
    rmdir /s /q node_modules
    echo [OK] Frontend node_modules deleted
)
if exist package-lock.json (
    del /f package-lock.json
    echo [OK] Frontend package-lock.json deleted
)
echo.

REM Install Frontend
echo [3/7] Installing Frontend Dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend installation failed!
    pause
    exit /b %errorlevel%
)
echo [OK] Frontend dependencies installed
echo.

REM Check Backend
echo [4/7] Checking Backend Dependencies...
cd ..\backend
if not exist node_modules (
    echo [INFO] Installing Backend Dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Backend installation failed!
        pause
        exit /b %errorlevel%
    )
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies found
)
echo.

REM Seed Database
echo [5/7] Seeding Database...
call npm run seed
if %errorlevel% neq 0 (
    echo [WARNING] Seed failed. Make sure MongoDB is running!
)
echo.

REM Clear Ports
echo [6/7] Clearing Ports...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>NUL
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>NUL
echo [OK] Ports cleared
echo.

REM Start Backend
echo [7/7] Starting Backend Server...
start "Backend - Port 5000" cmd /k "cd /d %~dp0backend && echo ======================================== && echo   Backend Server && echo ======================================== && npm run dev"
echo [OK] Backend starting...
timeout /t 5 /nobreak >nul

REM Start Frontend
echo Starting Frontend Application...
cd ..\frontend
start "Frontend - Port 3000" cmd /k "echo ======================================== && echo   Frontend Application && echo ======================================== && npm start"
echo [OK] Frontend starting...

echo.
echo ========================================
echo   APPLICATION STARTING!
echo ========================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
echo   Login:
echo   - Admin: admin / admin123
echo   - User:  user  / user123
echo.
echo   Two windows opened:
echo   - Backend Server (keep open)
echo   - Frontend App (keep open)
echo.
echo Waiting for frontend to start...
timeout /t 15 /nobreak >nul

echo Opening browser...
start http://localhost:3000

echo.
echo Press any key to STOP all servers...
pause >nul

echo.
echo Stopping servers...
taskkill /F /FI "WindowTitle eq Backend*" 2>NUL
taskkill /F /FI "WindowTitle eq Frontend*" 2>NUL
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>NUL
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>NUL

echo.
echo ========================================
echo   All servers stopped!
echo ========================================
pause
