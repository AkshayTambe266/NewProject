# Smart Attendance System (Flask + OpenCV)

## Features
- Register students with webcam snapshot
- Train OpenCV LBPH recognizer
- Recognize faces and mark daily attendance
- SQLite storage, CSV export
- Bootstrap UI

## Setup
```bash
# 1) Create venv (optional but recommended)
python3 -m venv .venv
source .venv/bin/activate

# 2) Install dependencies
pip install -r requirements.txt

# 3) Run the app
python app.py
# Open http://localhost:5000
```

## Usage
- Register page: enter name and roll no, capture image, then it auto-trains
- Attendance page: click Recognize & Mark to mark presence if matched
- Logs: view records and export CSV

Notes:
- LBPH confidence is lower when match is better. Threshold set to 75. Adjust if needed.
- For better accuracy, extend dataset to multiple samples per student and retrain.
