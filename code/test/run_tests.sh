#!/bin/bash

# Change to the code directory if not already there
cd "$(dirname "$0")/.." || exit

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Default variables
RUN_COVERAGE=false
TARGET_DIR="test/"
SPECIFIC_TEST=""
PYTEST_ARGS=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--coverage)
            RUN_COVERAGE=true
            shift
            ;;
        -m|--module)
            TARGET_DIR="test/$2"
            shift 2
            ;;
        -t|--test)
            SPECIFIC_TEST="$2"
            shift 2
            ;;
        -v|--verbose)
            PYTEST_ARGS="$PYTEST_ARGS -v"
            shift
            ;;
        -x|--exitfirst)
            PYTEST_ARGS="$PYTEST_ARGS -x"
            shift
            ;;
        -h|--help)
            echo "Usage: ./test/run_tests.sh [options]"
            echo ""
            echo "Options:"
            echo "  -c, --coverage        Run tests with coverage report"
            echo "  -m, --module MODULE   Run tests for a specific module (api, models, services, utils)"
            echo "  -t, --test TEST_FILE  Run a specific test file"
            echo "  -v, --verbose         Run tests in verbose mode"
            echo "  -x, --exitfirst       Exit after first test failure"
            echo "  -h, --help            Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./test/run_tests.sh                    # Run all tests"
            echo "  ./test/run_tests.sh -c                 # Run all tests with coverage"
            echo "  ./test/run_tests.sh -m api             # Run all API tests"
            echo "  ./test/run_tests.sh -t api/test_auth.py # Run specific test file"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Set the test target
if [[ -n "$SPECIFIC_TEST" ]]; then
    TEST_TARGET="test/$SPECIFIC_TEST"
else
    TEST_TARGET="$TARGET_DIR"
fi

# Run tests with or without coverage
if [[ "$RUN_COVERAGE" = true ]]; then
    echo "Running tests with coverage report for $TEST_TARGET..."
    python -m pytest $TEST_TARGET --cov=app $PYTEST_ARGS
else
    echo "Running tests for $TEST_TARGET..."
    python -m pytest $TEST_TARGET $PYTEST_ARGS
fi

# Report exit status
STATUS=$?
if [[ $STATUS -eq 0 ]]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed!"
fi

exit $STATUS 