const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // ✅ ADDED: Required to use fs.existsSync

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// --- Database Connection ---
const MONGO_URI = "mongodb://langaliyadevansh68_db_user:vzZSNvQQFJGXyKMb@ac-gcbigtu-shard-00-00.ygnsiov.mongodb.net:27017,ac-gcbigtu-shard-00-01.ygnsiov.mongodb.net:27017,ac-gcbigtu-shard-00-02.ygnsiov.mongodb.net:27017/vibemap?ssl=true&replicaSet=atlas-jzezrn-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.error("❌ DB Error:", err));

// --- Static File Serving ---
// Update: Checking both possible Angular output paths
let distPath = path.join(__dirname, '..', 'client', 'dist', 'client');

// Fallback to /browser if the standard path doesn't exist (depends on Angular version)
if (!fs.existsSync(distPath)) {
  distPath = path.join(distPath, 'browser');
}

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Handles Angular's client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log("✅ Static files serving from:", distPath);
} else {
  // If this logs, check your Render Build Command
  console.error("❌ ERROR: distPath does not exist:", distPath);
}

// --- Vibe Schema ---
const VibeSchema = new mongoose.Schema({
  user: { type: String, default: 'devansh' },
  message: { type: String, required: true },
  coords: { type: [Number], required: true }, // [lat, lng]
  createdAt: { type: Date, default: Date.now }
});
const Vibe = mongoose.model('Vibe', VibeSchema);

// --- API Routes ---
app.get('/api/vibes', async (req, res) => {
  try {
    const vibes = await Vibe.find().sort({ createdAt: -1 });
    res.json(vibes);
  } catch (err) { res.status(500).json(err); }
});

app.post('/api/vibes', async (req, res) => {
  try {
    const savedVibe = await new Vibe(req.body).save();
    io.emit('vibe-appeared', savedVibe);
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

// --- Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});