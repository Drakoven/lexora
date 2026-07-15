import { useEffect, useState } from "react";

import "./Profile.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";
import AvatarPicker from "../../components/AvatarPicker/AvatarPicker.jsx";
import { AVATARS } from "../../constants/avatars.js";
import * as profileApi from "../../api/profile.js";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function Profile() {
  const [profile, setProfile] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    profileApi.getProfile().then(setProfile);
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
        </section>

        <section className="profile-rank">
          <span className="profile-rank-badge">Non classé</span>
        </section>
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
