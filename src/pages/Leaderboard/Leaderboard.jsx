import { useEffect, useState } from "react";

import "./Leaderboard.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";
import { AVATARS } from "../../constants/avatars.js";
import { TIER_STYLES } from "../../constants/tiers.js";
import { useAuth } from "../../context/AuthContext.jsx";
import * as rankingApi from "../../api/ranking.js";

function avatarEmoji(avatar) {
  return AVATARS.find((a) => a.key === avatar)?.emoji || "🙂";
}

function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    rankingApi.getLeaderboard().then(setData);
  }, []);

  if (!data) {
    return (
      <AppLayout>
        <div className="page-placeholder">
          <h1>Classement</h1>
        </div>
      </AppLayout>
    );
  }

  const isInTop = data.leaderboard.some((player) => player.username === user?.username);

  return (
    <AppLayout>
      <div className="leaderboard-page">
        <h1>Classement</h1>

        {data.leaderboard.length === 0 ? (
          <p>Personne n'est encore classé — joue des parties en matchmaking aléatoire pour apparaître ici.</p>
        ) : (
          <ol className="leaderboard-list">
            {data.leaderboard.map((player) => (
              <li
                key={player.id}
                className={
                  player.username === user?.username
                    ? "leaderboard-row leaderboard-row-you"
                    : "leaderboard-row"
                }
              >
                <span className="leaderboard-position">#{player.position}</span>
                <span className="leaderboard-avatar">{avatarEmoji(player.avatar)}</span>
                <span className="leaderboard-username">{player.username}</span>
                <span
                  className="leaderboard-tier"
                  style={{ color: TIER_STYLES[player.tier.key]?.color }}
                >
                  {player.tier.label}
                </span>
                <span className="leaderboard-rating">{player.rating} pts</span>
              </li>
            ))}
          </ol>
        )}

        {!isInTop && (
          <p className="leaderboard-your-position">
            {data.you.tier.key === "unranked"
              ? "Tu n'es pas encore classé — joue des parties en matchmaking aléatoire pour te classer."
              : `Ta position : #${data.you.position} (${data.you.tier.label}, ${data.you.rating} pts)`}
          </p>
        )}
      </div>
    </AppLayout>
  );
}

export default Leaderboard;
