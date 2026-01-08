@echo off
echo ====================================
echo  StreamCredit - Starting All Services
echo ====================================
echo.

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 goto error

echo.
echo [2/3] Starting Mock API Server...
echo [3/3] Starting Frontend...
echo.
echo ====================================
echo  All services are starting...
echo ====================================
echo.
echo Mock API:  http://localhost:3001
echo Frontend:  http://localhost:3000
echo.
echo Press Ctrl+C to stop all services
echo ====================================
echo.

call npm run dev

goto end

:error
echo.
echo [ERROR] Failed to start services
pause
exit /b 1

:end
