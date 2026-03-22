const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path'); // 1. Added for handling file paths

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// 1. Database Connection (Cloud Atlas)
// Added /vibemap after the .net/ to ensure it saves to a specific database name
mongoose.connect('mongodb+srv://langaliyadevansh68_db_user:vzZSNvQQFJGXyKMb@cluster0.ygnsiov.mongodb.net/vibemap?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log("✅ Connected to MongoDB ATLAS Cloud!"))
  .catch(err => console.error("❌ Cloud Connection Error: ", err));

// 2. Schema Definition
const Vibe = mongoose.model('Vibe', new mongoose.Schema({
  user: String,
  message: String,
  coords: [Number],
  type: { type: String, default: 'chill' },
  createdAt: { type: Date, default: Date.now }
}));

// 3. API Route
app.get('/api/vibes', async (req, res) => {
  try {
    const vibes = await Vibe.find().sort({ createdAt: -1 });
    res.json(vibes);
  } catch (err) {
    res.status(500).json([]);
  }
});

// --- NEW SECTION FOR DEPLOYMENT ---
// 4. Serve the Frontend (Angular)
// This tells the server WHERE the folder of built files is
app.use(express.static(path.join(__dirname, '../client/dist/client/browser')));

// This tells the server WHICH file to show when a user visits the site
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/client/browser/index.html'));
});
// 5. Socket Logic
io.on('connection', (socket) => {
  console.log('✨ New Explorer Connected');
  socket.on('drop-vibe', async (data) => {
    try {
      const newVibe = new Vibe(data);
      const savedVibe = await newVibe.save();
      console.log("✅ Vibe locked into Database!");
      io.emit('vibe-appeared', savedVibe);
    } catch (err) {
      console.error("❌ Save Error:", err);
    }
  });
});

// 6. Dynamic Port for Render
// Render uses a random port, so we must check process.env.PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));