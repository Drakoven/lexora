import "./LoginForm.css";
import { useState } from "react";
import Button from "../Button/Button.jsx";

function LoginForm({ onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <section className="login-form">
      <button className="back-button" onClick={onBack}>
        ← Retour
      </button>

      <h2 className="login-form-title">Se connecter</h2>


    <form className="login-form-fields" onSubmit={(e) => {
      e.preventDefault();
    }}>
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
          placeholder="Entrez votre mot de passe" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button text="Se connecter" />
    </form>
    </section>
  );
}

export default LoginForm;