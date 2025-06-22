import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

//middleware for enabling CORS
// This allows cross-origin requests, which is useful for development
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
    })
  );
}

//middleware for parsing JSON bodies
app.use(express.json());

//middleware for rate limiting
// This will limit requests to 100 per minute per IP address
app.use(rateLimiter);

//middleware for logging requests
// app.use((req, res, next) => {
//   console.log(`${req.method} request for '${req.url}'`);
//   next();
// });

app.use("/api/notes", notesRoutes);

// Serve static files from the React frontend app
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);
  });
});
