# 🚌 Real-Time Public Transport Tracking System

A resilient college bus tracking system that works even in low bandwidth and high latency conditions.

## 🔗 Links
- **Live Demo:** [ThinkRoot Docs](https://app.thinkroot.dev/apps/ac387898-6025-4f32-af8f-a3e04062ce2f)
- **GitHub:** https://github.com/Kakul22/Transport_tracker

## 🚀 Features
- ✅ Live bus location tracking on map
- ✅ Auto reconnect on network drop
- ✅ Store and forward buffering
- ✅ ML-based ETA prediction (Random Forest)
- ✅ Network quality indicator (Good/Medium/Poor)
- ✅ Adaptive update frequency based on network

## 🛠️ Tech Stack
| Frontend | Backend | ML |
|---|---|---|
| React.js | FastAPI (Python) | scikit-learn |
| Leaflet.js | WebSocket | Random Forest |
| CSS | Uvicorn | NumPy |

## 📁 Project Structure
transport-tracker/
├── frontend/          # React app
│   └── src/
│       └── App.js     # Main map component
└── backend/           # FastAPI server
├── main.py        # WebSocket + GPS logic
└── eta_model.py   # ML ETA prediction

## ⚙️ Setup Instructions

### Backend
```bash
cd backend
pip install fastapi uvicorn websockets scikit-learn numpy
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```
### Architecture 
React Frontend (port 3000)
↕ WebSocket
FastAPI Backend (port 8000)
↕
ML ETA Model (Random Forest)




