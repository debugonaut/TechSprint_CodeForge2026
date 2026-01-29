# Recallr - Neural Command Center 🧠

Recallr is an AI-powered knowledge base that serves as your "second brain". It allows you to save links, automatically generates concise summaries using Gemini AI, and organizes your digital knowledge in a premium, neural-inspired interface.

## 🚀 Project Structure

This monorepo contains three main components:

- **`/frontend`**: The React-based web dashboard ("Neural Command Center").
- **`/backend`**: Node.js/Express API handling AI processing and database logic.
- **`/chrome-extension`**: Browser extension for quick saving (side-loaded).

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (Custom "Neural" Dark/Light Theme)
- **Animations**: Framer Motion (Liquid tabs, layout transitions)
- **Icons**: Lucide React
- **Data Viz**: Recharts (Analytics)
- **Auth**: Firebase Authentication

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **AI Engine**: Google Gemini 1.5 Flash (`@google/genai`)
- **Database**: Firebase Admin SDK (Firestore)
- **Scraping**: Cheerio + Axios

---

## 📦 Setup Instructions

### Prerequisites
- Node.js (v18+)
- Firebase Project credentials

### 1. Backend Setup
The backend handles URL processing and AI summarization.

```bash
cd backend
npm install
```

**Environment Variables (`backend/.env`):**
```env
PORT=5001
GEMINI_API_KEY=your_gemini_key
FIREBASE_SERVICE_ACCOUNT=path/to/service-account.json
# or inline credential variables
```

**Run Backend:**
```bash
npm start
# Server runs on http://localhost:5001
```

### 2. Frontend Setup
The "Neural Dashboard" UI.

```bash
cd frontend
npm install
```

**Environment Variables (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5001
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

**Run Frontend:**
```bash
npm run dev
# Dashboard runs on http://localhost:5173
```

### 3. Chrome Extension (Optional)
To save links directly from your browser:
1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer Mode** (top right).
3. Click **Load unpacked**.
4. Select the `/chrome-extension` directory.

---

## ✨ Key Features

- **Liquid UI**: Smooth, organic animations for tabs and navigation dock.
- **AI Summaries**: Automatic "Key Ideas" and summarization of saved content.
- **Smart Analytics**: Visual breakdown of your reading habits and topic distribution.
- **Read Reminders**: Habit-building tool with configurable notifications.
- **Dual Theme**: Fully responsive Dark (Default) and Light modes.

---

## 🤝 Contribution

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

*Built for TechSprint 2026*
