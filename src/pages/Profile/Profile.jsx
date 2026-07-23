import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Profile.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";
import AvatarPicker from "../../components/AvatarPicker/AvatarPicker.jsx";
import RatingChart from "../../components/RatingChart/RatingChart.jsx";
import { AVATARS } from "../../constants/avatars.js";
import { TIER_STYLES } from "../../constants/tiers.js";
import * as profileApi from "../../api/profile.js";
import * as badgesApi from "../../api/badges.js";
import * as rankingApi from "../../api/ranking.js";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [badgeCount, setBadgeCount] = useState(null);
  const [ratingHistory, setRatingHistory] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    profileApi.getProfile().then(setProfile);
    badgesApi.getBadges().then((badges) => {
      setBadgeCount({ earned: badges.filter((b) => b.earned).length, total: badges.length });
    });
    rankingApi.getRatingHistory().then(setRatingHistory);
  }, []);

  async function handleSelectAvatar(avatar) {
    const updated = await profileApi.updateAvatar(avatar);
    setProfile(updated);
    setIsPickerOpen(false);
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="page-placeholder">
          <h1>Profil</h1>
        </div>
      </AppLayout>
    );
  }

  const avatarEmoji = AVATARS.find((a) => a.key === profile.avatar)?.emoji;

  return (
    <AppLayout>
      <div className="profile-page">
        <section className="profile-header">
          <button
            type="button"
            className="profile-avatar"
            onClick={() => setIsPickerOpen(true)}
          >
            {avatarEmoji}
          </button>

          <div>
            <h1>{profile.username}</h1>
            <p className="profile-email">{profile.email}</p>
            <p className="profile-since">
              Membre depuis le {dateFormatter.format(new Date(profile.createdAt))}
            </p>
          </div>
        </section>

        <section className="profile-stats">
          <div className="profile-stat-card">
            <span className="profile-stat-value">{profile.gamesPlayed}</span>
            <span className="profile-stat-label">Parties jouées</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">{profile.wins}</span>
            <span className="profile-stat-label">Victoires</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">{profile.losses}</span>
            <span className="profile-stat-label">Défaites</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">{profile.currentStreak}</span>
            <span className="profile-stat-label">Série en cours</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">{profile.bestStreak}</span>
            <span className="profile-stat-label">Meilleure série</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">
              {profile.dailyStreak} 🔥
            </span>
            <span className="profile-stat-label">Jours consécutifs</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">{profile.bestDailyStreak}</span>
            <span className="profile-stat-label">Record de jours consécutifs</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">{profile.highestScore}</span>
            <span className="profile-stat-label">Meilleur score</span>
          </div>
        </section>

        <section className="profile-rank">
          <span
            className="profile-rank-badge"
            style={{ color: TIER_STYLES[profile.tier.key]?.color }}
          >
            {profile.tier.label}
          </span>
          {profile.tier.key !== "unranked" && (
            <span className="profile-rank-detail">
              {profile.rating} pts
              {profile.leaderboardPosition && ` — #${profile.leaderboardPosition} au classement`}
            </span>
          )}
        </section>

        <RatingChart history={ratingHistory} />

        <button type="button" className="profile-badges-link" onClick={() => navigate("/badges")}>
          🏅 Badges — {badgeCount ? `${badgeCount.earned} / ${badgeCount.total} débloqués` : "..."}
        </button>
      </div>

      {isPickerOpen && (
        <AvatarPicker
          currentAvatar={profile.avatar}
          onSelect={handleSelectAvatar}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </AppLayout>
  );
}

export default Profile;
