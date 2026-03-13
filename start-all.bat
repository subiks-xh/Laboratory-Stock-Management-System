@echo off
echo ================================================
echo   Laboratory Management System - Quick Start
echo ================================================
echo.

REM Check if backend is already running on port 5000
echo [1/4] Checking backend (port 5000)...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend is already running on port 5000
) else (
    echo [X] Backend is not running
    echo [*] Starting backend server...
    start "LabMS Backend" cmd /c "cd /d %~dp0zbackend && npm start"
    timeout /t 5 /nobreak >nul
    echo [OK] Backend server started
)

echo.
REM Check if frontend is already running on port 5173
echo [2/4] Checking frontend (port 5173)...
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend is already running on port 5173
) else (
    echo [X] Frontend is not running
    echo [*] Starting frontend server...
    start "LabMS Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"
    timeout /t 5 /nobreak >nul
    echo [OK] Frontend server started
)

echo.
echo [3/4] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Opening application in browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo ================================================
echo   Application started successfully!
echo ================================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo.
echo   Press any key to exit this window...
echo   (Servers will continue running in background)
echo ================================================
pause >nul
