import rateLimit from "express-rate-limit";

function limiter(options) {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ message: "Trop de tentatives, réessaie plus tard." });
    },
    ...options,
  });
}

// Cible spécifiquement le brute-force de mot de passe.
export const loginLimiter = limiter({ windowMs: 15 * 60 * 1000, max: 10 });

// Évite la création massive de comptes ou le bombardement d'emails
// (inscription, mot de passe oublié, renvoi de vérification).
export const authActionLimiter = limiter({ windowMs: 60 * 60 * 1000, max: 10 });
