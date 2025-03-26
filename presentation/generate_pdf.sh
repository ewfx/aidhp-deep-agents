#!/bin/bash

# Check if Chrome is installed
if command -v chrome > /dev/null 2>&1; then
    CHROME_CMD="chrome"
elif command -v google-chrome > /dev/null 2>&1; then
    CHROME_CMD="google-chrome"
elif command -v chromium > /dev/null 2>&1; then
    CHROME_CMD="chromium"
elif [ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    CHROME_CMD="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
else
    echo "Error: Chrome or Chromium not found. Please install it to generate the PDF."
    exit 1
fi

# Get the absolute path of the HTML file
HTML_FILE="$(pwd)/financial_advisor_presentation.html"
PDF_FILE="$(pwd)/financial_advisor_presentation.pdf"

echo "Generating PDF from HTML..."
"$CHROME_CMD" --headless --disable-gpu --print-to-pdf="$PDF_FILE" "$HTML_FILE"

if [ $? -eq 0 ]; then
    echo "PDF successfully generated at: $PDF_FILE"
else
    echo "Error generating PDF"
    exit 1
fi 