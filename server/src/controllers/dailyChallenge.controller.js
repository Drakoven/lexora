import * as dailyChallengeService from "../dailyChallenge/dailyChallengeService.js";

export async function getTodaysChallenge(req, res) {
  const result = await dailyChallengeService.getTodaysChallenge(req.session.userId);
  res.json(result);
}

export async function submitDailyChallenge(req, res) {
  const { placements } = req.body;
  const result = await dailyChallengeService.submitDailyChallenge(req.session.userId, placements);

  if (result.error) return res.status(400).json({ message: result.error });
  res.json(result);
}
