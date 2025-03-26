# Financial Advisor Dashboard - Setup Instructions

This document provides instructions for setting up and running the Financial Advisor Dashboard application on both Windows and Unix systems.

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.9 or higher
- Node.js 14 or higher
- Git
- MongoDB (optional, for local database usage)

## Setup Instructions

### Windows

1. Clone the repository and navigate to the source directory:
   ```
   git clone <repository-url>
   cd <repository-directory>/code/src
   ```

2. Run the installation script:
   ```
   install.bat
   ```

3. Start the application:
   ```
   start.bat
   ```
   
   Options:
   - Use `start.bat --local` to use a local MongoDB instance
   - Use `start.bat --remote` to use the remote MongoDB Atlas instance (default)

### Unix (macOS/Linux)

1. Clone the repository and navigate to the source directory:
   ```
   git clone <repository-url>
   cd <repository-directory>/code/src
   ```

2. Make scripts executable:
   ```
   chmod +x install.sh
   chmod +x start.sh
   ```

3. Run the installation script:
   ```
   ./install.sh
   ```

4. Start the application:
   ```
   ./start.sh
   ```
   
   Options:
   - Use `./start.sh --local` to use a local MongoDB instance
   - Use `./start.sh --remote` to use the remote MongoDB Atlas instance (default)

## Accessing the Application

Once the application is running:

- The backend API is available at: http://localhost:8000
- The frontend dashboard is available at: http://localhost:3000

## Default Login Credentials

The application comes with a pre-configured admin user:

- Username: `admin`
- Password: `admin123`

## Troubleshooting

### Common Issues

1. **Module not found errors**: Make sure you ran the installation script first and that it completed without errors.

2. **Port already in use**: If you get errors about ports 8000 or 3000 being in use, you can either close the applications using those ports or modify the scripts to use different ports.

3. **MongoDB connection issues**: If using a local MongoDB instance, ensure MongoDB is running. If using the remote instance, check your internet connection.

4. **Python path issues**: The installation script should set up the Python path correctly. If you're still having issues, try running the test_import.py script directly to debug:
   ```
   python test_import.py
   ```

### Getting Help

If you encounter any issues not covered here, please:

1. Check the log files in the application directory
2. Review the console output for error messages
3. Contact the development team with detailed information about your issue 