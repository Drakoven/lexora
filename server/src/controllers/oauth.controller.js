import passport, { googleEnabled, facebookEnabled } from "../config/passport.js";

function loginRedirect(res, code) {
  res.redirect(`${process.env.CLIENT_ORIGIN}/login?oauthError=${code}`);
}

function callback(strategy) {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      if (err) return loginRedirect(res, "server_error");
      // info est absent quand le provider lui-même refuse le consentement
      // (l'utilisateur clique "Annuler" sur l'écran Google/Facebook).
      if (!user) return loginRedirect(res, info?.code || "access_denied");

      req.session.userId = user.id;
      res.redirect(`${process.env.CLIENT_ORIGIN}/dashboard`);
    })(req, res, next);
  };
}

export const googleCallback = callback("google");
export const facebookCallback = callback("facebook");

export function requireGoogleEnabled(req, res, next) {
  if (!googleEnabled) return loginRedirect(res, "provider_disabled");
  next();
}

export function requireFacebookEnabled(req, res, next) {
  if (!facebookEnabled) return loginRedirect(res, "provider_disabled");
  next();
}
