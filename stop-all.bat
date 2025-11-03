@echo off
title Stop All Services
color 0C

echo ========================================
echo   Stopping Promotion Management System
echo ========================================
echo.

echo Closing Backend Server...
taskkill /F /FI "WindowTitle eq Backend*" 2>NUL

echo Closing Frontend Server...
taskkill /F /FI "WindowTitle eq Frontend*" 2>NUL

echo Killing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>NUL

echo Killing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>NUL

echo.
echo ========================================
echo   All services stopped!
echo ========================================
echo.
pause
