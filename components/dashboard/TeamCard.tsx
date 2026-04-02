"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TeamWithScore, Game, GameScore, Mission, MissionCompletion, Deduction } from "@/lib/types";
import { RANK_LABEL } from "@/utils/scoring";
import { ChevronDown, ChevronUp, Trophy, Target, AlertTriangle } from "lucide-react";

const RANK_MEDALS: Record<number, { emoji: string; label: string; className: string }> = {
  1: { emoji: "🥇", label: "1st Place", className: "text-yellow-500" },
  2: { emoji: "🥈", label: "2nd Place", className: "text-slate-400" },
  3: { emoji: "🥉", label: "3rd Place", className: "text-amber-600" },
  4: { emoji: "4th", label: "4th Place", className: "text-muted-foreground" },
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
    <Card
      className="overflow-hidden border-2 transition-all"
      style={{ borderColor: team.color + "60" }}
    >
      {/* Color accent strip */}
      <div className="h-2 w-full" style={{ backgroundColor: team.color }} />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold" style={{ color: team.color }}>
              {team.rank <= 3 ? medal.emoji : `#${team.rank}`}
            </span>
            <div>
              <CardTitle className="text-xl">{team.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{medal.label}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold" style={{ color: team.color }}>
              {team.total}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">points</div>
          </div>
        </div>

        {/* Score breakdown pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary" className="gap-1">
            <Trophy className="h-3 w-3" />
            Games: {team.gamePoints}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Target className="h-3 w-3" />
            Missions: {team.missionPoints}
          </Badge>
          {team.deductionPoints > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              -{team.deductionPoints} deducted
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Expand/Collapse */}
      <div
        className="px-6 pb-2 flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {expanded ? "Hide breakdown" : "View breakdown"}
      </div>

      {expanded && (
        <CardContent className="pt-0">
          <Tabs defaultValue="games">
            <TabsList className="w-full">
              <TabsTrigger value="games" className="flex-1">
                Games {teamGameScores.length > 0 && `(${teamGameScores.length})`}
              </TabsTrigger>
              <TabsTrigger value="missions" className="flex-1">
                Missions {teamMissions.length > 0 && `(${teamMissions.length})`}
              </TabsTrigger>
              {teamDeductions.length > 0 && (
                <TabsTrigger value="deductions" className="flex-1 text-destructive">
                  Deductions ({teamDeductions.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="games">
              {teamGameScores.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No game scores yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game</TableHead>
                      <TableHead className="text-center">Rank</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamGameScores.map(({ game, rank, points }) => (
                      <TableRow key={game.id}>
                        <TableCell className="font-medium">{game.name}</TableCell>
                        <TableCell className="text-center">{RANK_LABEL[rank]}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
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
                <p className="text-sm text-muted-foreground py-4 text-center">No missions completed yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mission</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMissions.map((mission) => (
                      <TableRow key={mission.id}>
                        <TableCell className="font-medium">{mission.name}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
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
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamDeductions.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.reason}</TableCell>
                        <TableCell className="text-right font-semibold text-destructive">
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
