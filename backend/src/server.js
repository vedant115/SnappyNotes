import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calculate the correct path to the frontend build directory
const publicPath = path.resolve(__dirname, "../public");

const app = express();
const PORT = process.env.PORT || 5001;

// Configure CORS to allow same-origin requests and Chrome extensions
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);

      // Allow requests from Chrome extensions and same origin
      if (origin.startsWith("chrome-extension://")) {
        return callback(null, true);
      }

      // In production, allow same-origin and localhost for development
      if (process.env.NODE_ENV === "production") {
        const allowedOrigins = [
          "https://snappynotes.onrender.com",
          "http://localhost:5173",
        ];

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
      } else {
        // In development, be more permissive
        return callback(null, true);
      }

      // Default to allowing the request
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for rate limiting
app.use(rateLimiter);

// API routes
app.use("/api/notes", notesRoutes);

// Debug route to check file paths
app.get("/api/debug", (req, res) => {
  try {
    const debug = {
      environment: process.env.NODE_ENV,
      currentDirectory: __dirname,
      publicPath: publicPath,
      publicPathExists: fs.existsSync(publicPath),
      files: {},
    };

    if (debug.publicPathExists) {
      debug.files.public = fs.readdirSync(publicPath);

      const assetsPath = path.join(publicPath, "assets");
      if (fs.existsSync(assetsPath)) {
        debug.files.assets = fs.readdirSync(assetsPath);
      }

      const indexHtmlPath = path.join(publicPath, "index.html");
      if (fs.existsSync(indexHtmlPath)) {
        debug.indexHtmlExists = true;
        debug.indexHtmlSize = fs.statSync(indexHtmlPath).size;
      }
    }

    res.json(debug);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Serve static files from the public directory
app.use(
  express.static(publicPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      } else if (filePath.endsWith(".ttf")) {
        res.setHeader("Content-Type", "font/ttf");
      } else if (filePath.endsWith(".woff")) {
        res.setHeader("Content-Type", "font/woff");
      } else if (filePath.endsWith(".woff2")) {
        res.setHeader("Content-Type", "font/woff2");
      }
    },
  })
);

// Handle all other routes by serving the index.html
app.get(/(.*)/, (req, res) => {
  // Skip API routes
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  const indexPath = path.join(publicPath, "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend build not found");
  }
});

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Public path: ${publicPath}`);
  });
});
