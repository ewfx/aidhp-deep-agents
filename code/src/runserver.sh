#!/bin/bash
# Run the FastAPI server

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Run the server
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 "$@" 