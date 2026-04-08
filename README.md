# VartaChat 💬

A full-stack, real-time anonymous chat application inspired by Omegle — connect with random strangers worldwide, instantly.

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS (mobile-first) |
| State Management | Zustand |
| Backend | Node.js + Express |
| Real-time | Socket.io |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |

## ✨ Features

- **Anonymous Guest Chat** — Chat without signing up. Guest ID stored in localStorage, history persisted in MongoDB.
- **Registered Accounts** — Sign up, log in, manage profile (name, bio, avatar).
- **Real-time Matchmaking** — Randomly paired with another online user (like Omegle).
- **Skip / Next** — Skip the current stranger and find a new match.
- **Typing Indicator** — See when the stranger is typing.
- **Emoji Support** — Built-in emoji picker.
- **Dark Mode** — Toggle between light and dark themes.
- **Mobile-First Design** — Fully responsive UI.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Install & Run

```bash
# Backend
cd backend && cp .env.example .env
# Edit .env with your MongoDB URI and JWT_SECRET
npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Open http://localhost:5173

## 📁 Structure

```
vartachat/
├── backend/
│   ├── server.js
│   └── src/
│       ├── config/db.js
│       ├── models/         # User, Message, Session
│       ├── routes/         # auth, profile, chat, guest
│       ├── controllers/
│       ├── middleware/auth.js
│       └── socket/socketHandler.js
└── frontend/
    └── src/
        ├── App.jsx
        ├── pages/          # Landing, Chat, Login, Register, Profile
        ├── components/     # Navbar, MessageBubble, EmojiPicker, etc.
        ├── context/        # Zustand stores
        └── utils/
```

## 🔒 Security
- Passwords hashed with bcrypt
- JWT auth (7-day expiry)
- Input validation with express-validator
- Environment variables for all secrets
