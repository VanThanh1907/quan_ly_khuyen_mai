@echo off
title Reset Project
color 0C

echo ========================================
echo   Resetting Project...
echo ========================================
echo.
echo This will:
echo - Delete all node_modules
echo - Delete package-lock.json files
echo - Reinstall all dependencies
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo [1/4] Cleaning Backend...
cd backend
if exist node_modules (
    rmdir /s /q node_modules
    echo [OK] Backend node_modules deleted
)
if exist package-lock.json (
    del package-lock.json
    echo [OK] Backend package-lock.json deleted
)

echo.
echo [2/4] Cleaning Frontend...
cd ..\frontend
if exist node_modules (
    rmdir /s /q node_modules
    echo [OK] Frontend node_modules deleted
)
if exist package-lock.json (
    del package-lock.json
    echo [OK] Frontend package-lock.json deleted
)

echo.
echo [3/4] Installing Backend Dependencies...
cd ..\backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend installation failed!
    pause
    exit /b %errorlevel%
)
echo [OK] Backend dependencies installed

echo.
echo [4/4] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend installation failed!
    pause
    exit /b %errorlevel%
)
echo [OK] Frontend dependencies installed

cd ..
echo.
echo ========================================
echo   Reset Complete!
echo ========================================
echo.
echo You can now run: run-all.bat
echo.
pause
