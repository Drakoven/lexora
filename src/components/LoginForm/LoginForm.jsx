import "./LoginForm.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../Button/Button.jsx";
import OAuthButtons from "../OAuthButtons/OAuthButtons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const OAUTH_ERROR_MESSAGES = {
  access_denied: "Connexion annulée.",
  email_missing:
    "Aucun email confirmé n'est associé à ce compte Facebook. Essaie une autre méthode de connexion.",
  provider_disabled: "Cette méthode de connexion n'est pas disponible pour le moment.",
  server_error: "Une erreur est survenue. Réessaie.",
};

function LoginForm({ onBack }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const oauthError = searchParams.get("oauthError");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() =>
    oauthError ? OAUTH_ERROR_MESSAGES[oauthError] || OAUTH_ERROR_MESSAGES.server_error : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (oauthError) setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (email.trim() === "") {
      setError("Veuillez entrer votre email.");
      return;
    }

    if (password.trim() === "") {
      setError("Veuillez entrer votre mot de passe.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="login-form">
      <button className="back-button" onClick={onBack}>
        ← Retour
      </button>

      <h2 className="login-form-title">Se connecter</h2>
      {error && <p className="login-form-error" role="alert">{error}</p>}

    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
        <input 
          id="email" 
          type="email" 
          placeholder="Entrez votre email" 
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />

        <label htmlFor="password">Mot de passe</label>
        <input 
          id="password" 
          type="password" 
          placeholder="Entrez votre mot de passe" 
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />

        <Button
          text={isSubmitting ? "Connexion..." : "Se connecter"}
          disabled={isSubmitting}
        />
    </form>

    <button type="button" className="forgot-password-link" onClick={() => navigate("/forgot-password")}>
      Mot de passe oublié ?
    </button>

    <OAuthButtons />
    </section>
  );
}

export default LoginForm;