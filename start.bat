@echo off
title Smart Attendance System

echo 🚀 Starting Smart Attendance System...

REM Create logs directory
if not exist "logs" mkdir logs

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.7 or higher.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 14 or higher.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install backend dependencies
echo 📦 Installing backend dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
if not exist "node_modules" npm install
cd ..

REM Start backend server
echo 🔧 Starting backend server...
call venv\Scripts\activate.bat
start "Backend Server" cmd /k "cd backend && python app.py"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo 🎨 Starting frontend server...
cd frontend
start "Frontend Server" cmd /k "npm start"
cd ..

echo ✅ Smart Attendance System is starting up!
echo 📊 Backend: http://localhost:5000
echo 🌐 Frontend: http://localhost:3000
echo.
echo 📝 Check the opened terminal windows for logs
echo 🛑 Close the terminal windows to stop the servers

pause