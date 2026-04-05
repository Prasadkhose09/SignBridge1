# 🤟 SignBridge — Real-Time Sign Language Recognition Platform

> A **full-stack, AI-powered application** that translates sign language gestures into text in real time — bridging communication between the deaf/hard-of-hearing community and the wider world.

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.2-brightgreen?style=flat-square&logo=springboot)
![Python](https://img.shields.io/badge/Python-ML%20Service-blue?style=flat-square&logo=python)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-purple?style=flat-square)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=flat-square&logo=react)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

---

## 📌 Overview

**SignBridge** is a real-time sign language recognition platform that uses a webcam feed, a Python ML model, and a Spring Boot WebSocket backend to translate hand gestures into readable text — live, in the browser.

The platform is built around three tightly integrated services:

- A **React frontend** that captures live webcam frames and displays translated output
- A **Java Spring Boot backend** that handles WebSocket connections, frame routing, and API orchestration
- A **Python ML microservice** that processes image frames and returns gesture predictions

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎥 Live Webcam Capture | Captures video frames directly in the browser |
| 🔁 Real-Time Translation | WebSocket-powered frame streaming for low-latency predictions |
| 🤖 ML-Based Gesture Recognition | Python service predicts sign language gestures from frames |
| 📡 Frame Routing API | Spring Boot orchestrates frame delivery to the ML service |
| 🌐 React Frontend | Clean UI to display live translations |
| ☁️ Deployed on Vercel | Frontend hosted at [signbridge-ecru.vercel.app](https://signbridge-ecru.vercel.app) |

---

## 🏗️ Architecture

SignBridge is a **3-service architecture** — each layer has a single, focused responsibility:

```
┌─────────────────────────────────────┐
│         React Frontend              │
│  (Webcam capture → WebSocket send)  │
└──────────────────┬──────────────────┘
                   │  WebSocket / REST
                   ▼
┌─────────────────────────────────────┐
│     Spring Boot Backend (Java)      │
│  SignLanguageController             │
│  PythonMLServiceImpl                │
│  WebSocket Config + Frame Router    │
└──────────────────┬──────────────────┘
                   │  HTTP (base64 frames)
                   ▼
┌─────────────────────────────────────┐
│       Python ML Microservice        │
│  (OpenCV + gesture model inference) │
│  Returns: predicted label + score   │
└─────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

**Frontend**
- React.js
- HTML5 / CSS3
- WebSocket API (browser-native)
- MediaDevices API (webcam access)

**Backend (Java)**
- Java 17
- Spring Boot 4.0.2
- Spring WebSocket
- Spring Web MVC
- Jackson (JSON processing)
- Apache Commons IO (file/frame handling)
- Lombok

**ML Service (Python)**
- Python 3
- OpenCV (frame processing)
- ML model for gesture inference
- REST API (receives frames, returns predictions)

**DevOps & Tools**
- Maven Wrapper
- Vercel (frontend deployment)
- Postman
- IntelliJ IDEA

---

## 📂 Project Structure

```
SignBridge1/
├── src/
│   └── main/
│       └── java/com/signbridge/signbridge/
│           ├── controller/
│           │   └── SignLanguageController.java   # REST + WebSocket endpoints
│           ├── service/
│           │   └── PythonMLServiceImpl.java      # Communicates with Python service
│           ├── dto/
│           │   ├── FrameRequest.java             # Incoming frame payload
│           │   └── PredictionResponse.java       # ML prediction result
│           └── config/                           # WebSocket configuration
│
├── python_service/                               # Python ML microservice
│   └── app.py                                    # Flask/FastAPI inference server
│
├── public/                                       # Static frontend assets
├── src/ (React)                                  # React frontend source
├── pom.xml
└── compile_log.txt
```

---

## 🔗 API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sign/predict` | Submit a single frame for sign prediction |
| `GET`  | `/api/sign/health`  | Check backend & ML service health |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `/ws/sign` | WebSocket connection for real-time frame streaming |

### Example — Frame Prediction Request

```json
POST /api/sign/predict
{
  "frameData": "<base64-encoded-image>",
  "sequenceNumber": 42
}
```

**Response:**
```json
{
  "success": true,
  "predictedLabel": "Hello",
  "confidence": 0.94,
  "message": "Prediction successful"
}
```

---

## ⚙️ Getting Started

### Prerequisites

- Java 17+
- Python 3.8+
- Node.js 18+
- Maven (or use the included `./mvnw` wrapper)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Prasadkhose09/SignBridge1.git
cd SignBridge1
```

---

### 2. Start the Python ML Service

```bash
cd python_service
pip install -r requirements.txt
python app.py
```

The ML service will start at **`http://localhost:5000`**

---

### 3. Configure & Run the Spring Boot Backend

Update the Python service URL in `src/main/resources/application.properties` if needed:

```properties
python.ml.service.url=http://localhost:5000
server.port=8080
```

Then run:

```bash
./mvnw spring-boot:run
```

The backend will start at **`http://localhost:8080`**

---

### 4. Start the React Frontend

```bash
npm install
npm start
```

The app will open at **`http://localhost:3000`**

---

## 🎮 How It Works

1. **User opens the app** — the React frontend requests webcam access via the browser's MediaDevices API.
2. **Frames are captured** — the frontend continuously grabs frames from the video feed and encodes them as base64.
3. **Frames are sent** — via WebSocket (or REST), each frame is forwarded to the Spring Boot backend as a `FrameRequest`.
4. **Backend routes the frame** — `PythonMLServiceImpl` sends the frame to the Python microservice over HTTP.
5. **Python predicts the gesture** — the ML model processes the frame and returns a predicted label with a confidence score.
6. **Result is returned** — the backend sends the `PredictionResponse` back to the frontend, which renders the translated text in real time.

---

## 🌍 Live Demo

The frontend is deployed on Vercel:
**[https://signbridge-ecru.vercel.app](https://signbridge-ecru.vercel.app)**

> ⚠️ Note: The live demo requires the backend and Python ML service to be running locally or hosted separately for predictions to work.

---

## 🚀 Future Improvements

- [ ] Support for full ISL (Indian Sign Language) gesture vocabulary
- [ ] Sentence-level prediction (not just single gestures)
- [ ] Text-to-speech output for predicted signs
- [ ] Docker Compose for one-command startup of all 3 services
- [ ] Cloud deployment of backend + Python service
- [ ] Confidence threshold tuning UI
- [ ] Mobile-responsive camera support
- [ ] Support for multiple sign language standards (ASL, BSL, ISL)

---

## 👨‍💻 Author

**Prasad Khose** — Java Backend Developer | Final Year IT Engineering Student

[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-blueviolet?style=flat-square)](https://prasad-khose-portfolio.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Prasadkhose09-black?style=flat-square&logo=github)](https://github.com/Prasadkhose09)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/prasad-khose-686b81258)
[![Email](https://img.shields.io/badge/Email-prasadkhose512%40gmail.com-red?style=flat-square&logo=gmail)](mailto:prasadkhose512@gmail.com)

---

> ⭐ If SignBridge inspired you, consider giving it a star on GitHub!
