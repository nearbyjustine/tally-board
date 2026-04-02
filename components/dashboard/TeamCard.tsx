"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TeamWithScore, Game, GameScore, Mission, MissionCompletion, Deduction } from "@/lib/types";
import { RANK_LABEL } from "@/utils/scoring";
import { ChevronDown, ChevronUp, Trophy, Target, AlertTriangle } from "lucide-react";

const RANK_MEDALS: Record<number, { emoji: string; label: string }> = {
  1: { emoji: "🥇", label: "1st Place" },
  2: { emoji: "🥈", label: "2nd Place" },
  3: { emoji: "🥉", label: "3rd Place" },
  4: { emoji: "4th", label: "4th Place" },
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

  const medal = RANK_MEDALS[team.rank] ?? RANK_MEDALS[4];

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
    <Card className="overflow-hidden border-2 border-border bg-white">
      {/* Color bar */}
      <div className="h-2 w-full" style={{ backgroundColor: team.color }} />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Rank circle */}
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center text-white font-black text-lg shrink-0"
              style={{ backgroundColor: team.color }}
            >
              {team.rank <= 3 ? (
                <span className="text-2xl">{medal.emoji}</span>
              ) : (
                <span>#{team.rank}</span>
              )}
            </div>
            <div>
              <CardTitle className="text-xl font-extrabold uppercase tracking-tight">
                {team.name}
              </CardTitle>
              <p className="text-xs font-bold text-smoke uppercase tracking-wide">{medal.label}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black" style={{ color: team.color }}>
              {team.total}
            </div>
            <div className="text-[10px] font-bold text-smoke uppercase tracking-widest">points</div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-campfire/10 text-campfire px-3 py-1.5 rounded-full">
            <Trophy className="h-3 w-3" />
            +{team.gamePoints} games
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-flame/10 text-flame px-3 py-1.5 rounded-full">
            <Target className="h-3 w-3" />
            +{team.missionPoints} missions
          </span>
          {team.deductionPoints > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-destructive/10 text-destructive px-3 py-1.5 rounded-full">
              <AlertTriangle className="h-3 w-3" />
              -{team.deductionPoints} deducted
            </span>
          )}
        </div>
      </CardHeader>

      {/* Expand toggle */}
      <button
        type="button"
        className="w-full px-6 pb-3 flex items-center justify-center gap-1.5 text-xs font-bold text-smoke hover:text-ash transition-colors uppercase tracking-wide"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {expanded ? "Hide breakdown" : "View breakdown"}
      </button>

      {expanded && (
        <CardContent className="pt-0">
          <Tabs defaultValue="games">
            <TabsList className="w-full">
              <TabsTrigger value="games" className="flex-1 font-bold text-xs uppercase">
                Games {teamGameScores.length > 0 && `(${teamGameScores.length})`}
              </TabsTrigger>
              <TabsTrigger value="missions" className="flex-1 font-bold text-xs uppercase">
                Missions {teamMissions.length > 0 && `(${teamMissions.length})`}
              </TabsTrigger>
              {teamDeductions.length > 0 && (
                <TabsTrigger value="deductions" className="flex-1 font-bold text-xs uppercase text-destructive">
                  Deductions ({teamDeductions.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="games">
              {teamGameScores.length === 0 ? (
                <p className="text-sm font-medium text-smoke py-4 text-center">No game scores yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold text-xs uppercase">Game</TableHead>
                      <TableHead className="text-center font-bold text-xs uppercase">Rank</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamGameScores.map(({ game, rank, points }) => (
                      <TableRow key={game.id}>
                        <TableCell className="font-semibold">{game.name}</TableCell>
                        <TableCell className="text-center font-bold">{RANK_LABEL[rank]}</TableCell>
                        <TableCell className="text-right font-black text-campfire">
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
                <p className="text-sm font-medium text-smoke py-4 text-center">No missions completed yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold text-xs uppercase">Mission</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMissions.map((mission) => (
                      <TableRow key={mission.id}>
                        <TableCell className="font-semibold">{mission.name}</TableCell>
                        <TableCell className="text-right font-black text-campfire">
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
                      <TableHead className="font-bold text-xs uppercase">Reason</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamDeductions.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-semibold">{d.reason}</TableCell>
                        <TableCell className="text-right font-black text-destructive">
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
    </Card>
  );
}
