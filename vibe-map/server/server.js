const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path'); // ✅ ADD THIS LINE: Critical for finding your Angular files

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

// --- Static File Serving (Fixes the "Not Found" error) ---
const distPath = path.join(__dirname, '../client/dist/client/browser');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath);
});

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

const PORT = process.env.PORT || 3000; // ✅ Render uses dynamic ports; this is required
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});