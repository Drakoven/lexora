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

// Limité par compte (userId), pas par IP : deux joueurs qui s'affrontent
// depuis le même foyer/réseau ne doivent jamais se marcher dessus sur leur
// quota. Ne s'applique qu'après requireAuth, où req.session.userId existe
// forcément.
function byUser(req) {
  return String(req.session.userId);
}

// Coups réels (soumission, échange, passe, victoire réclamée) + actions de
// création/jointure de partie : une vraie partie ne déclenche jamais des
// dizaines de ces actions par minute, donc une limite généreuse suffit à
// bloquer un script qui spammerait sans gêner un joueur normal. Couvre
// aussi l'analyse post-partie, qui relance le moteur de génération de
// coups (coûteux en CPU) pour chaque coup de la partie.
export const gameActionLimiter = limiter({ windowMs: 60 * 1000, max: 30, keyGenerator: byUser });

// L'aperçu du score est appelé automatiquement (debounce 250ms) à chaque
// changement de placement pendant que le joueur pose ses tuiles — besoin
// d'une limite bien plus large pour ne jamais gêner une pose normale.
export const gamePreviewLimiter = limiter({ windowMs: 60 * 1000, max: 120, keyGenerator: byUser });
