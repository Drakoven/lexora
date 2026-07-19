import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import "./VerifyEmail.css";
import Button from "../../components/Button/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import * as authApi from "../../api/auth.js";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { user, refreshUser } = useAuth();

  const [status, setStatus] = useState(token ? "loading" : "missing");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    authApi
      .verifyEmail(token)
      .then(async () => {
        if (user) await refreshUser();
        setStatus("done");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main className="login-page">
      <h1 className="visually-hidden">Vérification de l'email — Lexora</h1>
      <section className="login-form">
        <h2 className="login-form-title">Vérification de l'email</h2>

        {status === "loading" && <p>Vérification en cours...</p>}

        {status === "done" && (
          <>
            <p>Ton email est confirmé, merci !</p>
            <Button text={user ? "Retour au jeu" : "Se connecter"} onClick={() => navigate(user ? "/dashboard" : "/login")} />
          </>
        )}

        {(status === "error" || status === "missing") && (
          <>
            <p className="login-form-error">
              {status === "missing" ? "Ce lien de vérification est incomplet." : error}
            </p>
            <p>Le lien a peut-être expiré — tu peux en redemander un depuis ton compte.</p>
            <Button text="Se connecter" onClick={() => navigate("/login")} />
          </>
        )}
      </section>
    </main>
  );
}

export default VerifyEmail;
