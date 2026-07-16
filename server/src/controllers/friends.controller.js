import * as friendsRepo from "../friends/friendsRepository.js";

export async function sendRequest(req, res) {
  const username = (req.body.username || "").trim();
  const userId = req.session.userId;

  if (!username) return res.status(400).json({ message: "Pseudo requis." });

  const target = await friendsRepo.findUserByUsername(username);
  if (!target) return res.status(404).json({ message: "Aucun joueur avec ce pseudo." });
  if (target.id === userId) return res.status(400).json({ message: "Tu ne peux pas t'ajouter toi-même." });

  const existing = await friendsRepo.findFriendship(userId, target.id);
  if (existing) {
    return res.status(400).json({
      message: existing.status === "accepted" ? "Vous êtes déjà amis." : "Une demande est déjà en attente.",
    });
  }

  const request = await friendsRepo.createRequest(userId, target.id);
  res.status(201).json(request);
}

export async function acceptRequest(req, res) {
  const userId = req.session.userId;
  const friendship = await friendsRepo.getFriendshipById(req.params.id);

  if (!friendship || friendship.addressee_id !== userId || friendship.status !== "pending") {
    return res.status(400).json({ message: "Demande introuvable." });
  }

  await friendsRepo.acceptRequest(friendship.id);
  res.status(204).end();
}

export async function declineOrRemove(req, res) {
  const userId = req.session.userId;
  const friendship = await friendsRepo.getFriendshipById(req.params.id);

  if (!friendship || (friendship.requester_id !== userId && friendship.addressee_id !== userId)) {
    return res.status(400).json({ message: "Relation introuvable." });
  }

  await friendsRepo.deleteFriendship(friendship.id);
  res.status(204).end();
}

export async function listFriends(req, res) {
  const friends = await friendsRepo.listAcceptedFriends(req.session.userId);
  res.json(friends);
}

export async function listPendingRequests(req, res) {
  const requests = await friendsRepo.listPendingRequests(req.session.userId);
  res.json(requests);
}
