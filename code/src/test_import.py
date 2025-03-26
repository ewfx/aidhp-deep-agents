#!/usr/bin/env python3
"""
Test script to verify app module can be imported correctly.
Works on both Windows and Unix platforms.
"""
import sys
import os
import platform

# Print current directory
print(f"Current directory: {os.getcwd()}")

# Print Python path
print("Python path:")
for path in sys.path:
    print(f"  - {path}")

# Add current directory to path if not already there
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
    print(f"Added current directory to Python path: {current_dir}")

# Try importing app module
try:
    import app
    print("✓ Successfully imported app module")
    print(f"  - app module location: {app.__file__}")
    
    # Try importing app.main
    try:
        import app.main
        print("✓ Successfully imported app.main module")
        print(f"  - app.main module location: {app.main.__file__}")
    except ImportError as e:
        print(f"× Error importing app.main: {e}")
except ImportError as e:
    print(f"× Error importing app module: {e}")
    
    # Check if app directory exists
    if os.path.exists('app'):
        print("App directory exists but couldn't import it. Contents:")
        for item in os.listdir('app'):
            print(f"  - {item}")
    else:
        print("App directory doesn't exist in the current directory.")
        
    # Check platform-specific issues
    if platform.system() == "Windows":
        print("\nWindows-specific checks:")
        print("- Check that .venv is activated properly")
        print("- Check for any spaces or special characters in the path")
        print(f"- Current path: {os.getcwd()}") 