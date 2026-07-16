import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Badges.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";
import * as badgesApi from "../../api/badges.js";

function Badges() {
  const navigate = useNavigate();
  const [badges, setBadges] = useState(null);

  useEffect(() => {
    badgesApi.getBadges().then(setBadges);
  }, []);

  if (!badges) {
    return (
      <AppLayout>
        <div className="page-placeholder">
          <h1>Badges</h1>
        </div>
      </AppLayout>
    );
  }

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <AppLayout>
      <div className="badges-page">
        <button type="button" className="badges-back" onClick={() => navigate("/profile")}>
          ← Retour au profil
        </button>
        <h1>Badges</h1>
        <p className="badges-progress">
          {earnedCount} / {badges.length} débloqués
        </p>

        <div className="badges-grid">
          {badges.map((badge) => (
            <div
              key={badge.key}
              className={badge.earned ? "badge-card badge-card-earned" : "badge-card badge-card-locked"}
            >
              <span className="badge-emoji">{badge.emoji}</span>
              <span className="badge-label">{badge.label}</span>
              <span className="badge-description">{badge.description}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default Badges;
