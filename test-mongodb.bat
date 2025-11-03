@echo off
title Test MongoDB Connection
color 0E

echo ========================================
echo   Testing MongoDB Connection
echo ========================================
echo.

cd backend
node testConnection.js

echo.
pause
