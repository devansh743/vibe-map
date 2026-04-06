const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// ✅ IMPROVED: Specific CORS for Render and Local
const io = new Server(server, {
  cors: {
    origin: ["https://vibe-map.onrender.com", "http://localhost:4200"],
    methods: ["GET", "POST"]
  },
  transports: ['polling', 'websocket'] // Force polling support for Render
});

app.use(cors());
app.use(express.json());

// --- Database Connection ---
const MONGO_URI = "mongodb://langaliyadevansh68_db_user:vzZSNvQQFJGXyKMb@ac-gcbigtu-shard-00-00.ygnsiov.mongodb.net:27017,ac-gcbigtu-shard-00-01.ygnsiov.mongodb.net:27017,ac-gcbigtu-shard-00-02.ygnsiov.mongodb.net:27017/vibemap?ssl=true&replicaSet=atlas-jzezrn-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.error("❌ DB Error:", err));

// --- Vibe Schema ---
const VibeSchema = new mongoose.Schema({
  user: { type: String, default: 'devansh' },
  message: { type: String, required: true },
  coords: { type: [Number], required: true }, // [lat, lng]
  createdAt: { type: Date, default: Date.now }
});
const Vibe = mongoose.model('Vibe', VibeSchema);

// --- API Routes (MUST COME BEFORE STATIC FILES) ---
app.get('/api/vibes', async (req, res) => {
  try {
    const vibes = await Vibe.find().sort({ createdAt: -1 });
    res.json(vibes);
  } catch (err) { res.status(500).json(err); }
});

app.post('/api/vibes', async (req, res) => {
  try {
    const savedVibe = await new Vibe(req.body).save();
    console.log("📡 Emitting vibe-appeared:", savedVibe.message);
    io.emit('vibe-appeared', savedVibe); // THIS IS THE BROADCAST
    res.json(savedVibe);
  } catch (err) { res.status(500).json(err); }
});

app.delete('/api/vibes/:id', async (req, res) => {
  try {
    await Vibe.findByIdAndDelete(req.params.id);
    io.emit('vibe-deleted', req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json(err); }
});

// --- Static File Serving (MOVED TO BOTTOM) ---
let distPath = path.join(__dirname, '..', 'client', 'dist', 'client');
if (!fs.existsSync(distPath)) {
  distPath = path.join(distPath, 'browser');
}

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Handles Angular's client-side routing ONLY if API routes don't match
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
  console.log("✅ Static files serving from:", distPath);
}

// --- Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});