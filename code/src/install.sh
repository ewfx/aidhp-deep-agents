#!/bin/bash

echo "Starting installation process..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python is not installed! Please install Python 3.9 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed! Please install Node.js 14 or higher."
    exit 1
fi

# Get the current directory
SCRIPT_DIR=$(pwd)
echo "Installation directory: $SCRIPT_DIR"

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Upgrade pip
python3 -m pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
python3 -m pip install -r requirements.txt

# Create a test user for testing
echo "Creating test user..."
python3 create_test_user.py

# Install additional dependencies that might be missing
echo "Installing additional dependencies..."
pip install python-jose[cryptography]==3.4.0
pip install email-validator==2.1.1
pip install pandas==2.2.2

# Add the current directory to Python path
echo "Setting up Python path..."
SITE_PACKAGES=$(python3 -c "import site; print(site.getsitepackages()[0])")
echo "Creating path file in: $SITE_PACKAGES"
echo "$SCRIPT_DIR" > "$SITE_PACKAGES/app.pth"

# Verify critical packages are installed
echo "Verifying critical packages..."
python3 -c "from jose import JWTError, jwt; print('✓ JWT packages verified')" || {
    echo "Error: JWT packages not installed correctly. Trying again..."
    pip uninstall -y python-jose
    pip uninstall -y cryptography
    pip install cryptography==42.0.5
    pip install python-jose[cryptography]==3.4.0
    python3 -c "from jose import JWTError, jwt; print('✓ JWT packages verified (retry)')" || {
        echo "Error: JWT packages still not installed correctly. Please check your Python environment."
        exit 1
    }
}

# Verify email validator package
python3 -c "import email_validator; print('✓ Email validator package verified')" || {
    echo "Error: Email validator package not installed correctly. Trying again..."
    pip install email-validator==2.1.1
    python3 -c "import email_validator; print('✓ Email validator package verified (retry)')" || {
        echo "Error: Email validator package still not installed correctly. Please check your Python environment."
        exit 1
    }
}

# Verify pandas package
python3 -c "import pandas; print('✓ Pandas package verified')" || {
    echo "Error: Pandas package not installed correctly. Trying again..."
    pip install pandas==2.2.2
    python3 -c "import pandas; print('✓ Pandas package verified (retry)')" || {
        echo "Error: Pandas package still not installed correctly. Please check your Python environment."
        exit 1
    }
}

# Verify app module is in the Python path
echo "Verifying Python path setup..."
python3 -c "import sys; print('Current Python path:'); print('\n'.join(sys.path))"
python3 -c "import sys; sys.path.append('$SCRIPT_DIR'); print('✓ App directory added to Python path')"

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create .env file if it doesn't exist
echo "Checking .env file..."
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOL
# MongoDB Configuration
MONGODB_URL=mongodb+srv://wf-hack:eAzy@123@dataset-db.ky0bo.mongodb.net/dataset?retryWrites=true&w=majority
MONGODB_DB=dataset
MONGODB_USER=wf-hack
MONGODB_PASSWORD=eAzy@123
USE_LOCAL_DB=false

# API Keys
OPENAI_API_KEY=
MISTRAL_API_KEY=Uf6oAM3GC8D18fi3Zn6lVNUNxp92Z592
GOOGLE_API_KEY=AIzaSyDbtwa0HfpRqmFUV3D1vEUIyYHBBHWLy6M
EOL
fi

echo
echo "Installation completed successfully!"
echo "You can now run start.sh to start the application."
echo 