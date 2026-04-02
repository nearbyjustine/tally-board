import type { Team, Game, GameScore, Mission, MissionCompletion, Deduction, TeamWithScore } from "@/lib/types";

const RANK_KEY = ["points_1st", "points_2nd", "points_3rd", "points_4th"] as const;

export function computeTeamScores(
  teams: Team[],
  games: Game[],
  gameScores: GameScore[],
  missions: Mission[],
  missionCompletions: MissionCompletion[],
  deductions: Deduction[]
): TeamWithScore[] {
  const gameMap = new Map<string, Game>(games.map((g) => [g.id, g]));
  const missionMap = new Map<string, Mission>(missions.map((m) => [m.id, m]));

  const scored = teams.map((team) => {
    // Game points
    const teamGameScores = gameScores.filter((gs) => gs.team_id === team.id);
    const gamePoints = teamGameScores.reduce((sum, gs) => {
      const game = gameMap.get(gs.game_id);
      if (!game) return sum;
      return sum + game[RANK_KEY[gs.rank - 1]];
    }, 0);

    // Mission points
    const teamMissions = missionCompletions.filter((mc) => mc.team_id === team.id);
    const missionPoints = teamMissions.reduce((sum, mc) => {
      const mission = missionMap.get(mc.mission_id);
      if (!mission) return sum;
      return sum + mission.points;
    }, 0);

    // Deductions
    const teamDeductions = deductions.filter((d) => d.team_id === team.id);
    const deductionPoints = teamDeductions.reduce((sum, d) => sum + d.amount, 0);

    const total = gamePoints + missionPoints - deductionPoints;

    return {
      ...team,
      total,
      gamePoints,
      missionPoints,
      deductionPoints,
      rank: 0, // will be set below
    } as TeamWithScore;
  });

  // Sort by total descending and assign ranks
  scored.sort((a, b) => b.total - a.total);
  scored.forEach((team, i) => {
    team.rank = i + 1;
  });

  return scored;
}

export function getTeamGameBreakdown(
  teamId: string,
  games: Game[],
  gameScores: GameScore[]
): { game: Game; rank: number; points: number }[] {
  const gameMap = new Map<string, Game>(games.map((g) => [g.id, g]));
  return gameScores
    .filter((gs) => gs.team_id === teamId)
    .map((gs) => {
      const game = gameMap.get(gs.game_id)!;
      return {
        game,
        rank: gs.rank,
        points: game[RANK_KEY[gs.rank - 1]],
      };
    });
}

export const RANK_LABEL: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
};

export const MEDAL_EMOJI: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
  4: "4th",
};
