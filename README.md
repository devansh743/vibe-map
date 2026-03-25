# 📍 VibeMap - Real-Time Geo-Social Map

VibeMap is a full-stack **MEAN (MongoDB, Express, Angular, Node.js)** application that allows users to "drop a vibe" (a message with a mood/category) anywhere on a global map. Using **Socket.io**, these vibes appear instantly for all connected users without needing to refresh the page.

## 🚀 Features
- **Interactive Map:** Right-click anywhere on the Leaflet-powered map to drop a message.
- **Real-Time Updates:** Seamless synchronization across all clients using WebSockets.
- **Persistent Storage:** All "vibes" are stored in MongoDB and reloaded on page refresh.
- **Live Counter:** Real-time tracking of the total number of vibes dropped globally.
- **Smooth Navigation:** Click on a vibe card in the sidebar to "fly" the map to that specific location.

## 🛠️ Tech Stack
- **Frontend:** Angular 17+, Leaflet.js (Maps), CSS3 (Dark Theme)
- **Backend:** Node.js, Express.js
- **Real-Time:** Socket.io
- **Database:** MongoDB (Mongoose ODM)

## 📋 Prerequisites
Before running this project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally on port 27017)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

## ⚙️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/devansh743/vibe-map.git
cd vibe-map

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 2. Configure Environment Variables

Create a `.env` file in the server folder:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and add your MongoDB connection string:

```
MONGO_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/vibemap?retryWrites=true&w=majority
PORT=3000
CORS_ORIGIN=*
```

### 3. Start Development Servers

**Terminal 1 - Backend (from root directory):**
```bash
cd server
npm start
# Server runs on http://localhost:3000
```

**Terminal 2 - Frontend (from root directory):**
```bash
cd client
npm start
# Angular dev server runs on http://localhost:4200
```

Open browser to `http://localhost:4200`

### 4. Build for Production

```bash
# Build the Angular frontend
cd client
npm run build

# The backend will automatically serve the built frontend
cd ../server
npm start
# Production build runs on http://localhost:3000
```

## 🔧 Project Structure

```
Mean_Project/
├── server/           # Node.js + Express + Socket.io backend
│   ├── server.js     # Main server file
│   ├── package.json
│   └── .env          # Configuration (create from .env.example)
├── client/           # Angular 16 frontend
│   ├── src/
│   │   ├── app/      # Angular components
│   │   └── index.html
│   ├── package.json
│   └── angular.json
└── README.md
```

## 🚀 Features

- **Interactive Map:** Right-click anywhere on the Leaflet-powered map to drop a message
- **Real-Time Updates:** Seamless synchronization using WebSockets (Socket.io)
- **Persistent Storage:** All vibes stored in MongoDB
- **Live Counter:** Real-time tracking of total vibes
- **Smooth Navigation:** Click vibe cards to fly to their location

## 📚 API Endpoints

- `GET /api/vibes` - Get all vibes
- `POST /api/vibes` - Create a new vibe
- `WS /socket.io` - WebSocket connection for real-time updates

## 🔌 WebSocket Events

- `connection` - New user connects
- `drop-vibe` - User drops a vibe on the map
- `vibe-appeared` - Broadcast new vibe to all connected users
- `disconnect` - User disconnects

## 📝 License

MIT
