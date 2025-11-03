@echo off
echo ========================================
echo   Promotion Management System Setup
echo ========================================
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b %errorlevel%
)
echo Backend dependencies installed successfully!
echo.

echo [2/4] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b %errorlevel%
)
echo Frontend dependencies installed successfully!
echo.

echo [3/4] Setting up database with sample data...
cd ..\backend
call npm run seed
if %errorlevel% neq 0 (
    echo Warning: Could not seed database. Make sure MongoDB is running!
    echo You can run 'npm run seed' later from the backend folder.
)
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the application:
echo   1. Open a terminal and run: cd backend && npm run dev
echo   2. Open another terminal and run: cd frontend && npm start
echo.
echo Or use the start.bat script to start both servers automatically.
echo.
pause
