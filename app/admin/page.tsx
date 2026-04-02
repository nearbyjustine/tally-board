"use client";

import { useScoreData } from "@/hooks/useScoreData";
import { computeTeamScores } from "@/utils/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, Gamepad2, Target, MinusCircle, Trophy, ArrowRight } from "lucide-react";

export default function AdminOverview() {
  const { teams, members, games, gameScores, missions, missionCompletions, deductions, loading } =
    useScoreData();

  const rankedTeams = computeTeamScores(
    teams, games, gameScores, missions, missionCompletions, deductions
  );

  const quickLinks = [
    { href: "/admin/teams", label: "Teams & Members", icon: Users, count: teams.length, sub: `${members.length} members`, color: "text-blue-500" },
    { href: "/admin/games", label: "Games & Scores", icon: Gamepad2, count: games.length, sub: `${gameScores.length} scores recorded`, color: "text-purple-500" },
    { href: "/admin/missions", label: "Missions", icon: Target, count: missions.length, sub: `${missionCompletions.length} completions`, color: "text-green-500" },
    { href: "/admin/deductions", label: "Deductions", icon: MinusCircle, count: deductions.length, sub: `${deductions.reduce((s, d) => s + d.amount, 0)} pts total`, color: "text-red-500" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Camp Lagablab — quick summary</p>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-2 gap-4">
        {quickLinks.map(({ href, label, icon: Icon, count, sub, color }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`${color} bg-current/10 rounded-xl p-2.5`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{label}</div>
                    <div className="text-xs text-muted-foreground">{sub}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{count}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Current standings */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Current Standings
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : rankedTeams.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No teams yet. <Link href="/admin/teams" className="underline text-foreground">Add teams</Link> to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {rankedTeams.map((team, i) => (
              <Card key={team.id} className="overflow-hidden">
                <div className="flex items-center">
                  <div className="w-1.5 h-full self-stretch" style={{ backgroundColor: team.color }} />
                  <CardContent className="flex-1 py-3 px-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg w-6 text-center">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                      </span>
                      <span className="font-semibold">{team.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-muted-foreground hidden sm:flex gap-2">
                        <span>+{team.gamePoints} games</span>
                        {team.missionPoints > 0 && <span>+{team.missionPoints} missions</span>}
                        {team.deductionPoints > 0 && <span className="text-destructive">-{team.deductionPoints} deducted</span>}
                      </div>
                      <Badge style={{ backgroundColor: team.color, color: "#fff" }}>
                        {team.total} pts
                      </Badge>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
