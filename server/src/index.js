import "dotenv/config";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import session from "express-session";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import gameRoutes from "./routes/game.routes.js";
import gamesRoutes from "./routes/games.routes.js";
import { registerSocketHandlers } from "./realtime/socket.js";
import { setIO } from "./realtime/io.js";

const app = express();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(sessionMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/games", gamesRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Erreur serveur." });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  },
});

io.engine.use(sessionMiddleware);
setIO(io);
registerSocketHandlers(io);

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`Lexora API en écoute sur http://localhost:${port}`);
});
