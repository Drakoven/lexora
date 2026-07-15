import "./RegisterForm.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function RegisterForm({ onBack }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (username.trim() === "" || email.trim() === "" || password === "") {
      setError("Tous les champs sont requis.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await register({ username, email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="register-form">
      <button className="back-button" onClick={onBack}>
        ← Retour
      </button>

      <h2 className="register-form-title">Créer un compte</h2>
      {error && <p className="register-form-error">{error}</p>}

      <form className="register-form-fields" onSubmit={handleSubmit}>
        <label htmlFor="username">Pseudo</label>
        <input
          id="username"
          type="text"
          placeholder="Choisissez un pseudo"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Entrez votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          placeholder="Choisissez un mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label htmlFor="confirm-password">Confirmer le mot de passe</label>
        <input
          id="confirm-password"
          type="password"
          placeholder="Confirmez votre mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          text={isSubmitting ? "Création..." : "Créer un compte"}
          disabled={isSubmitting}
        />
      </form>
    </section>
  );
}

export default RegisterForm;
