# Quick Start Guide

## Development Setup

### Prerequisites
- Node.js v18+ installed
- MongoDB running locally (or use MongoDB Atlas)
- Angular CLI installed: `npm install -g @angular/cli`

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

### 2. Configure MongoDB

Edit `server/.env` with your MongoDB connection string:
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/vibemap?retryWrites=true&w=majority
```

### 3. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
# Runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
# Runs on http://localhost:4200
```

### 4. Use the App
Open http://localhost:4200 in your browser and start dropping vibes!

## Production Build

```bash
# Build frontend
cd client
npm run build

# Start server (serves built frontend)
cd ../server
npm start
# Entire app runs on http://localhost:3000
```

## Troubleshooting

**Port Already in Use:**
- Backend: `netstat -ano | findstr :3000` (Windows) 
- Frontend: `netstat -ano | findstr :4200` (Windows)

**MongoDB Connection Failed:**
- Ensure MongoDB is running or check your connection string in `.env`
- Whitelist your IP in MongoDB Atlas if using cloud

**Socket.io Connection Issues:**
- Check browser console for WebSocket errors
- Verify CORS_ORIGIN in server/.env matches your client URL

## Project Files

- `server/server.js` - Main Express + Socket.io server
- `client/src/app/` - Angular components
- `client/angular.json` - Angular build configuration
- `server/.env` - Environment variables (create from .env.example)
