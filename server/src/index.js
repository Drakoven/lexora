import "dotenv/config";
import * as Sentry from "@sentry/node";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import passport from "./config/passport.js";
import { Server } from "socket.io";

import pool from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import gameRoutes from "./routes/game.routes.js";
import gamesRoutes from "./routes/games.routes.js";
import friendsRoutes from "./routes/friends.routes.js";
import rankingRoutes from "./routes/ranking.routes.js";
import badgesRoutes from "./routes/badges.routes.js";
import pushRoutes from "./routes/push.routes.js";
import { registerSocketHandlers } from "./realtime/socket.js";
import { setIO } from "./realtime/io.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Optionnel : n'active Sentry que si un DSN est fourni (comme SMTP_HOST pour
// l'email), pour que le dev local n'ait pas besoin d'un compte Sentry.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: isProduction ? "production" : "development",
  });
}

// Nécessaire derrière le reverse proxy d'un hébergement mutualisé (O2Switch, etc.)
// pour que req.secure / les cookies "secure" reflètent bien la requête HTTPS d'origine.
if (isProduction) app.set("trust proxy", 1);

const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore({ createDatabaseTable: false }, pool);

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // "none" est nécessaire en prod car frontend/backend vivent sur des domaines
    // différents (cookie cross-site) ; ça exige secure:true (HTTPS obligatoire).
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
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
// Pas de passport.session() : l'authentification OAuth garde la même source
// de vérité que le reste de l'app, req.session.userId (voir config/passport.js).
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/badges", badgesRoutes);
app.use("/api/push", pushRoutes);

if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

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
