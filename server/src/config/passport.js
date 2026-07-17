import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { findOrCreateOAuthUser, OAuthAccountError } from "../services/oauthAccount.service.js";

// passport n'est utilisé ici que comme client OAuth2 (échange de code,
// récupération du profil) — jamais comme gestionnaire de session : toutes
// les routes appellent authenticate() avec { session: false }, donc pas de
// serializeUser/deserializeUser/passport.session() nulle part. La seule
// source de vérité de connexion reste req.session.userId, fixé à la main
// dans oauth.controller.js, exactement comme login() le fait déjà.

export const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
export const facebookEnabled = Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

// Les constructeurs de strategy lèvent une exception synchrone si les
// identifiants manquent — on ne les enregistre donc que si les variables
// d'env sont présentes, pour que le serveur démarre normalement en dev
// sans app Google/Facebook configurée (même pattern que SMTP_HOST/SENTRY_DSN).

if (googleEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_ORIGIN}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider: "google",
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName,
          });
          done(null, user);
        } catch (err) {
          if (err instanceof OAuthAccountError) return done(null, false, { code: err.code });
          done(null, false, { code: "server_error" });
        }
      }
    )
  );
}

if (facebookEnabled) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.SERVER_ORIGIN}/api/auth/facebook/callback`,
        profileFields: ["id", "displayName", "emails"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider: "facebook",
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName,
          });
          done(null, user);
        } catch (err) {
          if (err instanceof OAuthAccountError) return done(null, false, { code: err.code });
          done(null, false, { code: "server_error" });
        }
      }
    )
  );
}

export default passport;
