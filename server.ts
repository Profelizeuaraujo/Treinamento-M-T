import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface ScoreEntry {
  id: string;
  userId: string;
  userName: string;
  mode: 'mouse' | 'keyboard';
  score: number;
  date: string;
}

interface ActiveUser {
  id: string;
  name: string;
  game: string;
  startTime: string;
  lastSeen: string;
}

const DB_FILE = path.join(process.cwd(), "db.json");

let db = {
  scores: [] as ScoreEntry[]
};

if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    console.error("Error reading db.json", e);
  }
}

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// In-memory active users (doesn't need persistence across restarts)
let activeUsers: Map<string, ActiveUser> = new Map();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/scores", (req, res) => {
    res.json(db.scores);
  });

  app.post("/api/scores", (req, res) => {
    const entry = req.body as ScoreEntry;
    db.scores.push(entry);
    saveDb();
    res.json({ success: true });
  });

  app.get("/api/active_users", (req, res) => {
    // Filter out users who haven't pinged in 10 seconds
    const now = new Date().getTime();
    const active = Array.from(activeUsers.values()).filter(user => {
      return now - new Date(user.lastSeen).getTime() < 10000;
    });
    res.json(active);
  });

  app.post("/api/active_users", (req, res) => {
    const { id, name, game } = req.body;
    const now = new Date().toISOString();
    
    if (activeUsers.has(id)) {
      const existing = activeUsers.get(id)!;
      existing.lastSeen = now;
      existing.game = game;
      activeUsers.set(id, existing);
    } else {
      activeUsers.set(id, {
        id,
        name,
        game,
        startTime: now,
        lastSeen: now
      });
    }
    res.json({ success: true });
  });

  app.post("/api/active_users/leave", (req, res) => {
    const { id } = req.body;
    activeUsers.delete(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // app.get('*', ...) for Express v4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
