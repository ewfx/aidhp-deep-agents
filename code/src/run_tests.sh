#!/bin/bash
# Run the test scripts

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Run the onboarding test
echo "Running onboarding test..."
python3 test_onboarding.py 