import { useState } from "react";

import "./VerifyEmailBanner.css";
import * as authApi from "../../api/auth.js";

function VerifyEmailBanner() {
  const [status, setStatus] = useState("idle");

  async function handleResend() {
    setStatus("sending");
    try {
      await authApi.resendVerification();
      setStatus("sent");
    } catch {
      setStatus("idle");
    }
  }

  return (
    <div className="verify-email-banner">
      <span>Pense à vérifier ton adresse email pour sécuriser ton compte.</span>
      {status === "sent" ? (
        <span className="verify-email-banner-sent">Email renvoyé !</span>
      ) : (
        <button type="button" onClick={handleResend} disabled={status === "sending"}>
          {status === "sending" ? "Envoi..." : "Renvoyer l'email"}
        </button>
      )}
    </div>
  );
}

export default VerifyEmailBanner;
