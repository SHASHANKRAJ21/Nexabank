@echo off
echo 🏦 Starting NexaBank Microservices...

REM Start Account Service
echo Starting Account Service on port 8081...
start "Account Service" cmd /k "cd /d %~dp0backend\account-service && mvn spring-boot:run"

REM Start Card Service
echo Starting Card Service on port 8082...
start "Card Service" cmd /k "cd /d %~dp0backend\card-service && mvn spring-boot:run"

REM Start Loan Service
echo Starting Loan Service on port 8083...
start "Loan Service" cmd /k "cd /d %~dp0backend\loan-service && mvn spring-boot:run"

echo.
echo All backend services starting in separate windows...
echo.
echo Waiting 30 seconds for services to boot...
timeout /t 30 /nobreak

REM Start Admin Frontend
echo Starting Admin Dashboard...
start "Admin Dashboard" cmd /k "cd /d %~dp0frontend && npm install && npm start"

REM Start User Portal
echo Starting User Portal...
start "User Portal" cmd /k "cd /d %~dp0user-portal && npm install && npm start"

echo.
echo NexaBank is starting up!
echo   Admin Dashboard -> http://localhost:3000
echo   User Portal     -> http://localhost:3001
echo   Account API     -> http://localhost:8081
echo   Card API        -> http://localhost:8082
echo   Loan API        -> http://localhost:8083
pause
