@echo off
echo ================================
echo Starting E-Commerce Application
echo ================================
echo.

REM Check if RBAC tables exist
echo [INFO] To setup RBAC database, run: cd backend ^&^& npm run setup:rbac
echo.

REM Start backend server
echo [1/2] Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

REM Start frontend server
echo [2/2] Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ================================
echo Both servers are starting...
echo ================================
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5173
echo.
echo Test accounts (password: 123456):
echo   admin@example.com     - Admin
echo   manager@example.com   - Manager  
echo   staff1@example.com    - Staff
echo   vana@example.com      - Customer
echo.
echo Press any key to exit this window...
pause >nul
