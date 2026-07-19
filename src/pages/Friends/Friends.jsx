import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Friends.css";
import AppLayout from "../../components/AppLayout/AppLayout.jsx";
import Button from "../../components/Button/Button.jsx";
import { AVATARS } from "../../constants/avatars.js";
import * as friendsApi from "../../api/friends.js";
import * as gamesApi from "../../api/games.js";
import { shareOnFacebook } from "../../social/facebookShare.js";

function avatarEmoji(avatar) {
  return AVATARS.find((a) => a.key === avatar)?.emoji || "🙂";
}

function Friends() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [invitingId, setInvitingId] = useState(null);

  async function refresh() {
    const [friendsList, pending] = await Promise.all([
      friendsApi.listFriends(),
      friendsApi.listPendingRequests(),
    ]);
    setFriends(friendsList);
    setRequests(pending);
  }

  useEffect(() => {
    Promise.all([friendsApi.listFriends(), friendsApi.listPendingRequests()]).then(
      ([friendsList, pending]) => {
        setFriends(friendsList);
        setRequests(pending);
      }
    );
  }, []);

  async function handleSendRequest(e) {
    e.preventDefault();
    if (username.trim() === "") return;

    setError("");
    setIsBusy(true);
    try {
      await friendsApi.sendRequest(username.trim());
      setUsername("");
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleAccept(id) {
    await friendsApi.acceptRequest(id);
    await refresh();
  }

  async function handleDecline(id) {
    await friendsApi.declineOrRemove(id);
    await refresh();
  }

  async function handleRemove(id) {
    await friendsApi.declineOrRemove(id);
    await refresh();
  }

  async function handleInvite(friendUserId) {
    setError("");
    setInvitingId(friendUserId);
    try {
      const game = await gamesApi.inviteFriend(friendUserId);
      navigate(`/play/online/${game.code}`);
    } catch (err) {
      setError(err.message);
      setInvitingId(null);
    }
  }

  return (
    <AppLayout>
      <div className="friends-page">
        <h1>Amis</h1>

        <section className="friends-card">
          <h2>Inviter des amis</h2>
          <p>Fais découvrir Lexora à tes amis Facebook.</p>
          <button
            type="button"
            className="friends-share-button"
            onClick={() =>
              shareOnFacebook({
                url: "https://lexora-jeu.fr/",
                quote: "Je joue à Lexora, un Scrabble en ligne entre amis — viens jouer avec moi ! 🀄",
              })
            }
          >
            Inviter sur Facebook
          </button>
        </section>

        <section className="friends-card">
          <h2>Ajouter un ami</h2>
          <form onSubmit={handleSendRequest}>
            <input
              type="text"
              placeholder="Pseudo exact"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {error && <p className="friends-error" role="alert">{error}</p>}
            <Button text="Envoyer une demande" disabled={isBusy} />
          </form>
        </section>

        {requests.length > 0 && (
          <section className="friends-card">
            <h2>Demandes reçues</h2>
            <ul className="friends-list">
              {requests.map((req) => (
                <li key={req.friendship_id} className="friends-row">
                  <span className="friends-row-info">
                    <span className="friends-avatar">{avatarEmoji(req.avatar)}</span>
                    {req.username}
                  </span>
                  <span className="friends-row-actions">
                    <button className="friends-action-accept" onClick={() => handleAccept(req.friendship_id)}>
                      Accepter
                    </button>
                    <button className="friends-action-decline" onClick={() => handleDecline(req.friendship_id)}>
                      Refuser
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="friends-card">
          <h2>Tes amis</h2>
          {friends.length === 0 ? (
            <p>Tu n'as pas encore d'ami. Ajoute quelqu'un par son pseudo.</p>
          ) : (
            <ul className="friends-list">
              {friends.map((friend) => (
                <li key={friend.friendship_id} className="friends-row">
                  <span className="friends-row-info">
                    <span className="friends-avatar">{avatarEmoji(friend.avatar)}</span>
                    {friend.username}
                  </span>
                  <span className="friends-row-actions">
                    <button
                      className="friends-action-invite"
                      disabled={invitingId === friend.id}
                      onClick={() => handleInvite(friend.id)}
                    >
                      Inviter à jouer
                    </button>
                    <button className="friends-action-decline" onClick={() => handleRemove(friend.friendship_id)}>
                      Retirer
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

export default Friends;
