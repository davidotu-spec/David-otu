import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import path from "path";

dotenv.config();

const db = new Database("portfolio.db");

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    live_url TEXT,
    repo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Data
const seedProjects = db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number };
if (seedProjects.count === 0) {
  db.prepare(`
    INSERT INTO projects (title, description, category, image_url, live_url, repo_url)
    VALUES 
    ('AI Image Generator', 'A full-stack application that uses Gemini to generate high-quality images from text prompts.', 'AI/ML', 'https://picsum.photos/seed/ai/800/600', '#', '#'),
    ('Crypto Dashboard', 'Real-time cryptocurrency tracking dashboard with interactive charts and price alerts.', 'Fintech', 'https://picsum.photos/seed/crypto/800/600', '#', '#'),
    ('E-commerce Platform', 'A scalable e-commerce solution with integrated Stripe payments and inventory management.', 'E-commerce', 'https://picsum.photos/seed/shop/800/600', '#', '#')
  `).run();
}

const seedPosts = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
if (seedPosts.count === 0) {
  db.prepare(`
    INSERT INTO posts (title, content)
    VALUES 
    ('The Future of Web Development', 'Web development is evolving faster than ever. From AI-driven coding assistants to the rise of edge computing, the landscape is shifting. In this post, we explore the key trends that will define the next decade of the web.'),
    ('Mastering React 19', 'React 19 brings a host of new features and improvements. We dive deep into the new hooks, the compiler, and how to optimize your applications for the best user experience.'),
    ('Building Scalable APIs with Express', 'Express remains the go-to framework for Node.js developers. Learn how to structure your projects for scale, implement robust middleware, and handle complex database interactions.')
  `).run();
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Stripe API ---
  app.post("/api/create-checkout-session", async (req, res) => {
    console.log("POST /api/create-checkout-session - Received request:", req.body);
    
    if (!stripe) {
      console.error("Stripe not configured - STRIPE_SECRET_KEY is missing");
      return res.status(500).json({ error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables." });
    }

    const { amount, currency = "usd", name = "Support My Work" } = req.body;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name,
              },
              unit_amount: amount, // in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?success=true`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/?canceled=true`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Blog API ---
  app.get("/api/posts", (req, res) => {
    const posts = db.prepare("SELECT * FROM posts ORDER BY published_at DESC").all();
    res.json(posts);
  });

  app.get("/api/posts/:id", (req, res) => {
    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const comments = db.prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC").all(req.params.id);
    res.json({ ...post, comments });
  });

  app.post("/api/posts", (req, res) => {
    const { title, content } = req.body;
    const result = db.prepare("INSERT INTO posts (title, content) VALUES (?, ?)").run(title, content);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/posts/:id", (req, res) => {
    const { title, content } = req.body;
    db.prepare("UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(title, content, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/posts/:id", (req, res) => {
    db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/posts/:id/comments", (req, res) => {
    const { author, content } = req.body;
    const result = db.prepare("INSERT INTO comments (post_id, author, content) VALUES (?, ?, ?)").run(req.params.id, author, content);
    res.json({ id: result.lastInsertRowid });
  });

  // --- Projects API ---
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
    res.json(projects);
  });

  app.post("/api/projects", (req, res) => {
    const { title, description, category, image_url, video_url, live_url, repo_url } = req.body;
    const result = db.prepare(`
      INSERT INTO projects (title, description, category, image_url, video_url, live_url, repo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, category, image_url, video_url, live_url, repo_url);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/projects/:id", (req, res) => {
    db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
