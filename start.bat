@echo off
echo Starting Baby Monitor Application...

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python 3.7+ and try again.
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo pip is not installed or not in PATH. Please install pip and try again.
    exit /b 1
)

REM Install Python dependencies if not already installed
echo Installing Python dependencies...
pip install -r requirements.txt

REM Start the Python tracking service in a new window
start "Baby Monitor Tracking Service" cmd /c "python tracker.py"

REM Start the Python detection service in a new window
start "Baby Monitor Detection Service" cmd /c "python App.py"

REM Wait for the services to start
echo Waiting for services to start...
timeout /t 5 /nobreak

REM Start the Node.js server
echo Starting Node.js server...
npm run dev