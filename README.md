[README.md](https://github.com/user-attachments/files/21696886/README.md)
# PhishShield

PhishShield is a browser extension with a machine learning backend designed to detect and block phishing websites and malicious emails in real time.

## Features
- **Browser Extension UI** – Simple popup interface with background scripts for scanning URLs and emails.
- **Machine Learning Model** – XGBoost classifier trained to detect phishing threats.
- **Feature Extraction** – Extracts features from URLs and emails for model prediction.
- **Backend API** – Python Flask service for running predictions.
- **Real-Time Protection** – Identifies and blocks phishing attempts while browsing.

## Project Structure
```
PhishShield/
│
├── url/
│   ├── Frontend/          # Chrome extension UI and scripts
│   │   ├── popup.html
│   │   ├── popup.js
│   │   ├── background.js
│   │   ├── styles.css
│   │   └── manifest.json
│   └── backend/           # Python backend service
│       ├── app.py
│       ├── url_feature_extractor.py
│       ├── email_detector.py
│       ├── model/
│       │   ├── scaler.pkl
│       │   └── xgb_model.json
│       └── requirements.txt
│
├── requirements.txt       # Main dependencies
└── README.md              # Project documentation
```

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/USERNAME/PhishShield.git
cd PhishShield
```

### 2. Backend Setup
```bash
cd url/backend
pip install -r requirements.txt
python app.py
```

### 3. Load Chrome Extension
- Open Chrome and navigate to `chrome://extensions/`
- Enable **Developer Mode**
- Click **Load unpacked** and select `url/Frontend/`

## Usage
- The extension will automatically scan the URLs and emails you interact with.
- If a phishing attempt is detected, a warning will be displayed.

## License
This project is licensed under the MIT License.

---
**Author:** Neelakanta  
