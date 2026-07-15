import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";

import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Erreur serveur." });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Lexora API en écoute sur http://localhost:${port}`);
});
