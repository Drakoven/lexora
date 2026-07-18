import { notifyGameUpdated } from "../realtime/io.js";
import { sendPushToUser } from "../push/pushService.js";

// Partagé entre games.controller.js (coup d'un humain) et botService.js
// (coup du bot) — même effet de bord après n'importe quelle mutation
// acceptée : notifier les clients connectés et pousser une notification
// "à toi de jouer" au prochain joueur si besoin.
export function notifyMutationResult(code, result) {
  notifyGameUpdated(code);
  if (result.nextTurnUserId) {
    // Fire-and-forget : un envoi lent ou en échec ne doit jamais ralentir
    // la réponse à l'action du joueur qui vient de jouer.
    sendPushToUser(result.nextTurnUserId, {
      title: "À toi de jouer !",
      body: "C'est ton tour dans une partie Lexora.",
      url: `/play/online/${code}`,
    }).catch((err) => console.error("[push] envoi échoué:", err.message));
  }
}
