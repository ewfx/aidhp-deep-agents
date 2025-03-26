@echo off
echo Starting installation process...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed! Please install Python 3.9 or higher.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed! Please install Node.js 14 or higher.
    pause
    exit /b 1
)

REM Get the current directory
set SCRIPT_DIR=%cd%
echo Installation directory: %SCRIPT_DIR%

REM Create and activate virtual environment
echo Creating Python virtual environment...
python -m venv .venv
call .venv\Scripts\activate.bat

REM Install Python dependencies
echo Installing Python requirements...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Install additional dependencies that might be missing
echo Installing additional dependencies...
pip install python-jose[cryptography]==3.4.0
pip install email-validator==2.1.1
pip install pandas==2.2.2

REM Add the current directory to Python path
echo Setting up Python path...
for /f "tokens=*" %%a in ('python -c "import site; print(site.getsitepackages()[0])"') do set SITE_PACKAGES=%%a
echo Creating path file in: %SITE_PACKAGES%
echo %SCRIPT_DIR% > "%SITE_PACKAGES%\app.pth"

REM Verify critical packages are installed
echo Verifying critical packages...
python -c "from jose import JWTError, jwt; print('✓ JWT packages verified')" 2>nul
if errorlevel 1 (
    echo Error: JWT packages not installed correctly. Trying again...
    pip uninstall -y python-jose
    pip uninstall -y cryptography
    pip install cryptography==42.0.5
    pip install python-jose[cryptography]==3.4.0
    python -c "from jose import JWTError, jwt; print('✓ JWT packages verified (retry)')" 2>nul
    if errorlevel 1 (
        echo Error: JWT packages still not installed correctly. Please check your Python environment.
        pause
        exit /b 1
    )
)

REM Verify email validator package
python -c "import email_validator; print('✓ Email validator package verified')" 2>nul
if errorlevel 1 (
    echo Error: Email validator package not installed correctly. Trying again...
    pip install email-validator==2.1.1
    python -c "import email_validator; print('✓ Email validator package verified (retry)')" 2>nul
    if errorlevel 1 (
        echo Error: Email validator package still not installed correctly. Please check your Python environment.
        pause
        exit /b 1
    )
)

REM Verify pandas package
python -c "import pandas; print('✓ Pandas package verified')" 2>nul
if errorlevel 1 (
    echo Error: Pandas package not installed correctly. Trying again...
    pip install pandas==2.2.2
    python -c "import pandas; print('✓ Pandas package verified (retry)')" 2>nul
    if errorlevel 1 (
        echo Error: Pandas package still not installed correctly. Please check your Python environment.
        pause
        exit /b 1
    )
)

REM Verify app module is in the Python path
echo Verifying Python path setup...
python -c "import sys; print('Current Python path:'); print('\n'.join(sys.path))"
python -c "import sys; sys.path.append('%SCRIPT_DIR%'); print('✓ App directory added to Python path')"

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Create .env file if it doesn't exist
echo Checking .env file...
if not exist .env (
    echo Creating .env file...
    (
        echo # MongoDB Configuration
        echo MONGODB_URL=mongodb+srv://wf-hack:eAzy%%40123@dataset-db.ky0bo.mongodb.net/dataset?retryWrites=true^&w=majority
        echo MONGODB_DB=dataset
        echo MONGODB_USER=wf-hack
        echo MONGODB_PASSWORD=eAzy@123
        echo USE_LOCAL_DB=false
        echo.
        echo # API Keys
        echo OPENAI_API_KEY=
        echo MISTRAL_API_KEY=Uf6oAM3GC8D18fi3Zn6lVNUNxp92Z592
        echo GOOGLE_API_KEY=AIzaSyDbtwa0HfpRqmFUV3D1vEUIyYHBBHWLy6M
    ) > .env
)

echo.
echo Installation completed successfully!
echo You can now run start.bat to start the application.
echo.
pause 