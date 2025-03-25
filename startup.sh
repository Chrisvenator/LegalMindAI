#!/bin/bash

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run Flask backend in the background
python flask_backend.py &
FLASK_PID=$!

# Run React frontend (assuming you've set up a React project)
cd frontend || exit
npm start

# Wait for any process to exit
wait $FLASK_PID