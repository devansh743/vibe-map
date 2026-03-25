const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  } 
});

app.use(cors());
app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://langaliyadevansh68_db_user:vzZSNvQQFJGXyKMb@cluster0.ygnsiov.mongodb.net/vibemap?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB!"))
  .catch(err => console.error("❌ MongoDB Connection Error: ", err));

// Vibe Schema
const VibeSchema = new mongoose.Schema({
  user: { type: String, default: 'Anonymous' },
  message: { type: String, required: true },
  coords: { type: [Number], required: true },
  type: { type: String, default: 'chill' },
  createdAt: { type: Date, default: Date.now }
});

const Vibe = mongoose.model('Vibe', VibeSchema);

// API Routes
app.get('/api/vibes', async (req, res) => {
  try {
    const vibes = await Vibe.find().sort({ createdAt: -1 }).limit(100);
    res.json(vibes);
  } catch (err) {
    console.error('Error fetching vibes:', err);
    res.status(500).json({ error: 'Failed to fetch vibes' });
  }
});

app.post('/api/vibes', async (req, res) => {
  try {
    const newVibe = new Vibe(req.body);
    const savedVibe = await newVibe.save();
    io.emit('vibe-appeared', savedVibe);
    res.json(savedVibe);
  } catch (err) {
    console.error('Error saving vibe:', err);
    res.status(500).json({ error: 'Failed to save vibe' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), node: process.version });
});

// Serve Static Frontend
// CHANGE THIS LINE:
const distPath = path.join(__dirname, '../client/dist/client/browser');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  // SPA Fallback for client-side routing, but keep API routes intact
  app.get(/^((?!\/api).)*$/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('⚠️ Disallowing static serve: dist path not found. Build the client with npm run build first.');
}

// WebSocket Logic
io.on('connection', (socket) => {
  console.log('✨ New Explorer Connected');

  socket.on('drop-vibe', async (data) => {
    try {
      const newVibe = new Vibe(data);
      const savedVibe = await newVibe.save();
      console.log("✅ Vibe saved to Database!");
      io.emit('vibe-appeared', savedVibe);
    } catch (err) {
      console.error("❌ Save Error:", err);
      socket.emit('error', 'Failed to save vibe');
    }
  });

  socket.on('disconnect', () => {
    console.log('👋 Explorer Disconnected');
  });
});

// Express error handler
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on Port ${PORT}`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ON`);
});