@echo off
title Quick Start - Promotion Management
color 0B

echo ╔════════════════════════════════════════╗
echo ║  PROMOTION MANAGEMENT - QUICK START    ║
echo ╚════════════════════════════════════════╝
echo.

REM Start Backend in new window
start "Backend API (Port 5000)" cmd /k "cd backend && npm run dev"
echo [√] Backend starting...

REM Wait 5 seconds
timeout /t 5 /nobreak >nul

REM Start Frontend in new window
start "Frontend UI (Port 3000)" cmd /k "cd frontend && npm start"
echo [√] Frontend starting...

REM Wait 8 seconds then open browser
timeout /t 8 /nobreak >nul

echo.
echo [√] Opening browser...
start http://localhost:3000

echo.
echo ╔════════════════════════════════════════╗
echo ║  APPLICATION RUNNING!                  ║
echo ╠════════════════════════════════════════╣
echo ║  Frontend: http://localhost:3000       ║
echo ║  Backend:  http://localhost:5000       ║
echo ║                                        ║
echo ║  Login:                                ║
echo ║  • Admin: admin / admin123             ║
echo ║  • User:  user / user123               ║
echo ╚════════════════════════════════════════╝
echo.
echo Close this window to keep servers running.
echo To stop servers, close the Backend and Frontend windows.
echo.
pause