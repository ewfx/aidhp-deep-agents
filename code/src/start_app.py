#!/usr/bin/env python3
"""
Alternative starter script that handles Python path issues.
Works on both Windows and Unix platforms.
"""
import os
import sys
import subprocess
import time
import platform

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
    print(f"Added {current_dir} to Python path")

try:
    # First, verify we can import the app module
    import app
    print(f"Successfully imported app module from {app.__file__}")
    
    # Try importing app.main
    import app.main
    print(f"Successfully imported app.main module from {app.main.__file__}")
    
    # Now start the server using uvicorn
    print("Starting server with uvicorn...")
    
    # Set up the command based on platform
    if platform.system() == "Windows":
        # On Windows, we need to use the full path to uvicorn in the virtual environment
        venv_path = os.path.join(current_dir, ".venv")
        if os.path.exists(venv_path):
            uvicorn_path = os.path.join(venv_path, "Scripts", "uvicorn.exe")
            if not os.path.exists(uvicorn_path):
                uvicorn_path = "uvicorn"  # Fallback to system path
        else:
            uvicorn_path = "uvicorn"  # Fallback to system path
        
        cmd = [uvicorn_path, "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
    else:
        # On Unix, we can just use the command name
        cmd = ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
    
    # Use subprocess to start uvicorn
    print(f"Running command: {' '.join(cmd)}")
    process = subprocess.Popen(cmd)
    print(f"Server started with PID {process.pid}")
    
    # Keep the script running to keep the server running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping server...")
        process.terminate()
        process.wait()
        print("Server stopped")
        
except ImportError as e:
    print(f"Error importing app module: {e}")
    print("\nPython path:")
    for path in sys.path:
        print(f"  - {path}")
    
    # Check if app directory exists
    app_dir = os.path.join(current_dir, 'app')
    if os.path.exists(app_dir):
        print(f"\nApp directory exists at {app_dir}. Contents:")
        for item in os.listdir(app_dir):
            print(f"  - {item}")
    else:
        print(f"\nApp directory doesn't exist at {app_dir}")
    
    sys.exit(1) 