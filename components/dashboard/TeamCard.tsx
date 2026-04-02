"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TeamWithScore, Game, GameScore, Mission, MissionCompletion, Deduction } from "@/lib/types";
import { RANK_LABEL } from "@/utils/scoring";
import { ChevronDown, ChevronUp, Trophy, Target, AlertTriangle } from "lucide-react";

const RANK_STYLE: Record<number, { label: string; color: string }> = {
  1: { label: "1st Place", color: "#FACC15" },
  2: { label: "2nd Place", color: "#A8A29E" },
  3: { label: "3rd Place", color: "#D97706" },
  4: { label: "4th Place", color: "#78716C" },
};

interface TeamCardProps {
  team: TeamWithScore;
  games: Game[];
  gameScores: GameScore[];
  missions: Mission[];
  missionCompletions: MissionCompletion[];
  deductions: Deduction[];
}

export function TeamCard({
  team,
  games,
  gameScores,
  missions,
  missionCompletions,
  deductions,
}: TeamCardProps) {
  const [expanded, setExpanded] = useState(false);

  const rankInfo = RANK_STYLE[team.rank] ?? RANK_STYLE[4];

  const teamGameScores = gameScores
    .filter((gs) => gs.team_id === team.id)
    .map((gs) => {
      const game = games.find((g) => g.id === gs.game_id);
      if (!game) return null;
      const rankKey = (["points_1st", "points_2nd", "points_3rd", "points_4th"] as const)[gs.rank - 1];
      return { game, rank: gs.rank, points: game[rankKey] };
    })
    .filter(Boolean) as { game: Game; rank: number; points: number }[];

  const teamMissions = missionCompletions
    .filter((mc) => mc.team_id === team.id)
    .map((mc) => missions.find((m) => m.id === mc.mission_id))
    .filter(Boolean) as Mission[];

  const teamDeductions = deductions.filter((d) => d.team_id === team.id);

  return (
    <Card
      className={`overflow-hidden bg-white ${team.rank === 1 ? "card-first-place" : "shadow-card"} hover:shadow-card-hover transition-shadow`}
    >
      <div className="flex">
        {/* Left color border */}
        <div className="w-1.5 shrink-0 rounded-l-xl" style={{ backgroundColor: team.color }} />

        <div className="flex-1 min-w-0">
          <CardHeader className="pb-2 pt-5 px-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {/* Rank number */}
                <div
                  className="font-heading text-3xl font-extrabold tabular-nums shrink-0 w-10 text-center"
                  style={{ color: rankInfo.color }}
                >
                  {team.rank}
                </div>
                <div className="min-w-0">
                  <CardTitle className="font-heading text-lg font-bold tracking-tight truncate">
                    {team.name}
                  </CardTitle>
                  <p className="text-xs font-medium text-smoke mt-0.5">{rankInfo.label}</p>
                </div>
              </div>
              {/* Score */}
              <div className="text-right shrink-0">
                <div
                  className="font-heading text-4xl font-extrabold tabular-nums leading-none"
                  style={{ color: team.color }}
                >
                  {team.total}
                </div>
                <div className="text-[10px] font-medium text-smoke uppercase tracking-widest mt-1">PTS</div>
              </div>
            </div>

            {/* Score breakdown pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-campfire/8 text-campfire px-2.5 py-1 rounded-full">
                <Trophy className="h-3 w-3" />
                +{team.gamePoints} games
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-flame/8 text-flame px-2.5 py-1 rounded-full">
                <Target className="h-3 w-3" />
                +{team.missionPoints} missions
              </span>
              {team.deductionPoints > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-destructive/8 text-destructive px-2.5 py-1 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  -{team.deductionPoints} deducted
                </span>
              )}
            </div>
          </CardHeader>

          {/* Expand toggle */}
          <button
            type="button"
            className="w-full px-5 py-2.5 flex items-center justify-center gap-1.5 text-xs font-medium text-smoke hover:text-charcoal transition-colors border-t border-border/60"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Hide breakdown" : "View breakdown"}
          </button>

          {expanded && (
            <CardContent className="pt-0 px-5 pb-5">
              <Tabs defaultValue="games">
                <TabsList className="w-full">
                  <TabsTrigger value="games" className="flex-1 text-xs font-medium">
                    Games {teamGameScores.length > 0 && `(${teamGameScores.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="missions" className="flex-1 text-xs font-medium">
                    Missions {teamMissions.length > 0 && `(${teamMissions.length})`}
                  </TabsTrigger>
                  {teamDeductions.length > 0 && (
                    <TabsTrigger value="deductions" className="flex-1 text-xs font-medium text-destructive">
                      Deductions ({teamDeductions.length})
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="games">
                  {teamGameScores.length === 0 ? (
                    <p className="text-sm text-smoke py-4 text-center">No game scores yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs font-medium text-smoke">Game</TableHead>
                          <TableHead className="text-center text-xs font-medium text-smoke">Rank</TableHead>
                          <TableHead className="text-right text-xs font-medium text-smoke">Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamGameScores.map(({ game, rank, points }) => (
                          <TableRow key={game.id}>
                            <TableCell className="font-medium">{game.name}</TableCell>
                            <TableCell className="text-center font-medium">{RANK_LABEL[rank]}</TableCell>
                            <TableCell className="text-right font-semibold text-campfire tabular-nums">
                              +{points}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="missions">
                  {teamMissions.length === 0 ? (
                    <p className="text-sm text-smoke py-4 text-center">No missions completed yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs font-medium text-smoke">Mission</TableHead>
                          <TableHead className="text-right text-xs font-medium text-smoke">Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamMissions.map((mission) => (
                          <TableRow key={mission.id}>
                            <TableCell className="font-medium">{mission.name}</TableCell>
                            <TableCell className="text-right font-semibold text-campfire tabular-nums">
                              +{mission.points}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                {teamDeductions.length > 0 && (
                  <TabsContent value="deductions">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs font-medium text-smoke">Reason</TableHead>
                          <TableHead className="text-right text-xs font-medium text-smoke">Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamDeductions.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className="font-medium">{d.reason}</TableCell>
                            <TableCell className="text-right font-semibold text-destructive tabular-nums">
                              -{d.amount}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          )}
        </div>
      </div>
    </Card>
  );
}
