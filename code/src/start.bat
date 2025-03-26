@echo off
setlocal EnableDelayedExpansion

REM Parse command line arguments
set USE_LOCAL_DB=false
:parse_args
if "%~1"=="" goto end_parse
if "%~1"=="--help" (
    echo Usage: start.bat [options]
    echo Options:
    echo   --help     Show this help message
    echo   --local    Use local MongoDB (default: false^)
    echo   --remote   Use remote MongoDB (default: true^)
    exit /b 0
)
if "%~1"=="--local" set USE_LOCAL_DB=true
if "%~1"=="--remote" set USE_LOCAL_DB=false
shift
goto parse_args
:end_parse

REM Get the current directory
set SCRIPT_DIR=%cd%

REM Update .env file with database toggle setting
powershell -Command "(Get-Content .env) -replace '^USE_LOCAL_DB=.*', 'USE_LOCAL_DB=%USE_LOCAL_DB%' | Set-Content .env"

REM Kill any existing processes on ports 8000 and 3000
echo Stopping any existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

REM Activate virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate.bat

REM Check for dependencies
echo Checking for required dependencies...
python -c "import jose" 2>nul
if errorlevel 1 (
    echo Missing 'jose' package. Installing...
    pip install python-jose[cryptography]==3.4.0
)

python -c "import email_validator" 2>nul
if errorlevel 1 (
    echo Missing 'email_validator' package. Installing...
    pip install email-validator==2.1.1
)

python -c "import pandas" 2>nul
if errorlevel 1 (
    echo Missing 'pandas' package. Installing...
    pip install pandas==2.2.2
)

REM Run the test import script to verify app can be imported
echo Testing app module import...
python %SCRIPT_DIR%\test_import.py

REM Check if MongoDB is running locally when using local connection
if "%USE_LOCAL_DB%"=="true" (
    echo Using local MongoDB connection
    REM Check if MongoDB service is running
    sc query MongoDB >nul 2>&1
    if errorlevel 1 (
        echo Warning: MongoDB service is not running. Please start MongoDB service if needed.
    )
) else (
    echo Using remote MongoDB connection to MongoDB Atlas
)

REM Start the backend server
echo Starting the backend server on port 8000...
call .venv\Scripts\activate.bat

REM First validate that imports will work
echo Validating Python imports...
python -c "from jose import JWTError, jwt; print('✓ JWT imports validated')" 2>nul
if errorlevel 1 (
    echo Error: JWT imports failed. Running pip install to fix...
    pip install python-jose[cryptography]==3.4.0
)

python -c "import email_validator; print('✓ Email validator imports validated')" 2>nul
if errorlevel 1 (
    echo Error: Email validator imports failed. Running pip install to fix...
    pip install email-validator==2.1.1
)

python -c "import pandas; print('✓ Pandas imports validated')" 2>nul
if errorlevel 1 (
    echo Error: Pandas imports failed. Running pip install to fix...
    pip install pandas==2.2.2
)

REM Add current directory to PYTHONPATH to find the app module
set PYTHONPATH=%SCRIPT_DIR%;%PYTHONPATH%
echo PYTHONPATH set to: %PYTHONPATH%

REM Start the server with the Python script that handles importing properly
cd %SCRIPT_DIR%
echo Starting server with Python-based starter script...
start "Backend Server" cmd /c "call .venv\Scripts\activate.bat && set PYTHONPATH=%SCRIPT_DIR% && python %SCRIPT_DIR%\start_app.py"

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Verify the backend is running
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:8000/api/health -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Host 'Backend server is running successfully.' } else { Write-Host 'Backend server returned unexpected status code:' $response.StatusCode } } catch { Write-Host 'Failed to connect to backend server. It may still be starting or has encountered an error.' }"

REM Start the frontend
echo Starting the frontend on port 3000...
cd frontend
start "Frontend Server" cmd /c "npm start"

echo.
echo Application started!
echo Backend is running on http://localhost:8000
echo Frontend is running on http://localhost:3000
echo.
echo Press Ctrl+C in the respective windows to stop the servers
echo. 