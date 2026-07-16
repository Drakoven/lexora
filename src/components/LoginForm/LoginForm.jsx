import "./LoginForm.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function LoginForm({ onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

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
      {error && <p className="login-form-error">{error}</p>}

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
    </section>
  );
}

export default LoginForm;