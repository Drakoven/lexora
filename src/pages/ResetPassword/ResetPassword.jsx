import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import "./ResetPassword.css";
import Button from "../../components/Button/Button.jsx";
import * as authApi from "../../api/auth.js";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setIsDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <main className="login-page">
        <section className="login-form">
          <h1 className="login-form-title">Lien invalide</h1>
          <p>Ce lien de réinitialisation est incomplet ou invalide.</p>
          <Button text="Demander un nouveau lien" onClick={() => navigate("/forgot-password")} />
        </section>
      </main>
    );
  }

  return (
    <main className="login-page">
      <h1 className="visually-hidden">Nouveau mot de passe — Lexora</h1>
      <section className="login-form">
        <h2 className="login-form-title">Nouveau mot de passe</h2>

        {isDone ? (
          <>
            <p>Ton mot de passe a été mis à jour.</p>
            <Button text="Se connecter" onClick={() => navigate("/login")} />
          </>
        ) : (
          <>
            {error && <p className="login-form-error" role="alert">{error}</p>}

            <form onSubmit={handleSubmit}>
              <label htmlFor="password">Nouveau mot de passe</label>
              <input
                id="password"
                type="password"
                placeholder="Au moins 8 caractères"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />

              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Retape le mot de passe"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
              />

              <Button
                text={isSubmitting ? "Envoi..." : "Réinitialiser le mot de passe"}
                disabled={isSubmitting}
              />
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default ResetPassword;
