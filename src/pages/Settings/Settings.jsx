import "./Settings.css";
import { useEffect, useState } from "react";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";
import Button from "../../components/Button/Button.jsx";
import * as webPush from "../../push/webPush.js";

function Settings() {
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    webPush.getSubscriptionState().then(setState);
  }, []);

  async function handleEnable() {
    setError("");
    setBusy(true);
    try {
      await webPush.subscribeToPush();
      setState("subscribed");
    } catch {
      setState(await webPush.getSubscriptionState());
      setError("Impossible d'activer les notifications. Vérifie que ton navigateur les autorise pour ce site.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setError("");
    setBusy(true);
    try {
      await webPush.unsubscribeFromPush();
      setState("unsubscribed");
    } catch {
      setError("Impossible de désactiver les notifications, réessaie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppLayout>
      <div className="settings-page">
        <h1>Paramètres</h1>

        <section className="settings-section">
          <h2>Notifications</h2>
          <p className="settings-section-description">
            Reçois une notification quand c'est ton tour dans une partie en ligne.
          </p>

          {state === "unsupported" && (
            <p className="settings-notice">
              Ton navigateur ne supporte pas les notifications push.
            </p>
          )}

          {state === "denied" && (
            <p className="settings-notice">
              Les notifications sont bloquées pour Lexora dans les réglages de ton navigateur.
              Autorise-les puis reviens sur cette page.
            </p>
          )}

          {state === "unsubscribed" && (
            <Button text={busy ? "..." : "Activer les notifications"} onClick={handleEnable} disabled={busy} />
          )}

          {state === "subscribed" && (
            <Button text={busy ? "..." : "Désactiver les notifications"} onClick={handleDisable} disabled={busy} />
          )}

          {error && <p className="settings-error" role="alert">{error}</p>}

          <p className="settings-hint">
            Sur iPhone/iPad, installe d'abord Lexora sur l'écran d'accueil (Partager →
            "Sur l'écran d'accueil") pour que les notifications fonctionnent.
          </p>
        </section>
      </div>
    </AppLayout>
  );
}

export default Settings;
