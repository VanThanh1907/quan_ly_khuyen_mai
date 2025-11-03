@echo off
title Start MongoDB
color 0B

echo ========================================
echo   Starting MongoDB Server
echo ========================================
echo.

echo Checking if MongoDB is already running...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is already running!
    echo.
    pause
    exit /b 0
)

echo Starting MongoDB...
echo.
echo If you see "waiting for connections", MongoDB is ready!
echo Keep this window open while using the application.
echo.
mongod

pause
