#!/bin/bash

# Function to show help message
show_help() {
  echo "Usage: ./start.sh [options]"
  echo "Options:"
  echo "  -h, --help     Show this help message"
  echo "  -l, --local    Use local MongoDB (default: false)"
  echo "  -r, --remote   Use remote MongoDB (default: true)"
}

# Default settings
USE_LOCAL_DB=false

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -l|--local)
      USE_LOCAL_DB=true
      shift
      ;;
    -r|--remote)
      USE_LOCAL_DB=false
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Change to script directory
cd "$(dirname "$0")"
SCRIPT_DIR=$(pwd)

# Update .env file with database toggle setting
sed -i.bak "s/^USE_LOCAL_DB=.*/USE_LOCAL_DB=$USE_LOCAL_DB/" .env

# Kill any existing processes on ports 8000 and 3000
echo "Stopping any existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
  echo "Activating virtual environment..."
  source .venv/bin/activate
fi

# Check for dependencies
echo "Checking for required dependencies..."
python3 -c "import jose" 2>/dev/null
if [ $? -ne 0 ]; then
  echo "Missing 'jose' package. Installing..."
  pip install python-jose[cryptography]==3.4.0
fi

python3 -c "import email_validator" 2>/dev/null
if [ $? -ne 0 ]; then
  echo "Missing 'email_validator' package. Installing..."
  pip install email-validator==2.1.1
fi

python3 -c "import pandas" 2>/dev/null
if [ $? -ne 0 ]; then
  echo "Missing 'pandas' package. Installing..."
  pip install pandas==2.2.2
fi

# Run the test import script to verify app can be imported
echo "Testing app module import..."
python3 $SCRIPT_DIR/test_import.py

# Check if MongoDB is running locally
if $USE_LOCAL_DB; then
  echo "Using local MongoDB connection"
  if ! pgrep -x mongod > /dev/null; then
    echo "Warning: MongoDB is not running locally. Please start MongoDB service if needed."
  fi
else
  echo "Using remote MongoDB connection to MongoDB Atlas"
fi

# Start the backend server in the background
echo "Starting the backend server on port 8000..."
source .venv/bin/activate

# First validate that imports will work
echo "Validating Python imports..."
python3 -c "from jose import JWTError, jwt; print('✓ JWT imports validated')" || { 
  echo "Error: JWT imports failed. Running pip install to fix..."; 
  pip install python-jose[cryptography]==3.4.0; 
}

python3 -c "import email_validator; print('✓ Email validator imports validated')" || { 
  echo "Error: Email validator imports failed. Running pip install to fix..."; 
  pip install email-validator==2.1.1; 
}

python3 -c "import pandas; print('✓ Pandas imports validated')" || { 
  echo "Error: Pandas imports failed. Running pip install to fix..."; 
  pip install pandas==2.2.2; 
}

# Add current directory to PYTHONPATH to find the app module
export PYTHONPATH=$SCRIPT_DIR:$PYTHONPATH
echo "PYTHONPATH set to: $PYTHONPATH"

# Start the server with the Python script that handles importing properly
cd $SCRIPT_DIR
echo "Starting server with Python-based starter script..."
python3 $SCRIPT_DIR/start_app.py &
BACKEND_PID=$!

# Give the backend more time to start and check if it's still running
echo "Waiting for backend to initialize..."
sleep 5
if ! ps -p $BACKEND_PID > /dev/null; then
  echo "ERROR: Backend failed to start. Check the logs above for errors."
  exit 1
fi

# Start the frontend
echo "Starting the frontend on port 3000..."
cd frontend
npm start

# If frontend is killed, also kill the backend
trap "kill $BACKEND_PID" EXIT

echo "Application started!"
echo "Backend PID: $BACKEND_PID"
echo "Access the application at http://localhost:3000" 