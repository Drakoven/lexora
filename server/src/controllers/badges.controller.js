import { getBadgesForUser } from "../badges/badgesService.js";

export async function listBadges(req, res) {
  const badges = await getBadgesForUser(req.session.userId);
  res.json(badges);
}
