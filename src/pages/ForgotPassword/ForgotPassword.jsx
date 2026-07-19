import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./ForgotPassword.css";
import Button from "../../components/Button/Button.jsx";
import * as authApi from "../../api/auth.js";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (email.trim() === "") {
      setError("Veuillez entrer votre email.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setIsSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <h1 className="visually-hidden">Mot de passe oublié — Lexora</h1>
      <section className="login-form">
        <button className="back-button" onClick={() => navigate("/login")}>
          ← Retour
        </button>

        <h2 className="login-form-title">Mot de passe oublié</h2>

        {isSent ? (
          <p>
            Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.
            Pense à vérifier tes spams.
          </p>
        ) : (
          <>
            <p>Entre ton email, on t'envoie un lien pour choisir un nouveau mot de passe.</p>
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

              <Button
                text={isSubmitting ? "Envoi..." : "Envoyer le lien"}
                disabled={isSubmitting}
              />
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default ForgotPassword;
