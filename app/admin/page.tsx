"use client";

import { useScoreData } from "@/hooks/useScoreData";
import { computeTeamScores } from "@/utils/scoring";
import { Card, CardContent } from "@/components/ui/card";
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
    { href: "/admin/teams", label: "Teams & Members", icon: Users, count: teams.length, sub: `${members.length} members`, color: "#2196F3" },
    { href: "/admin/games", label: "Games & Scores", icon: Gamepad2, count: games.length, sub: `${gameScores.length} scores recorded`, color: "#9C27B0" },
    { href: "/admin/missions", label: "Missions", icon: Target, count: missions.length, sub: `${missionCompletions.length} completions`, color: "#4CAF50" },
    { href: "/admin/deductions", label: "Deductions", icon: MinusCircle, count: deductions.length, sub: `${deductions.reduce((s, d) => s + d.amount, 0)} pts total`, color: "#D32F2F" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight">Overview</h1>
        <p className="text-smoke text-sm font-semibold">Camp Lagablab — quick summary</p>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-2 gap-4">
        {quickLinks.map(({ href, label, icon: Icon, count, sub, color }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-2 border-border bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl p-2.5" style={{ backgroundColor: color + "18" }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{label}</div>
                    <div className="text-xs font-semibold text-smoke">{sub}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black">{count}</span>
                  <ArrowRight className="h-4 w-4 text-smoke group-hover:translate-x-0.5 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Current standings */}
      <div>
        <h2 className="text-lg font-black uppercase tracking-tight mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-campfire" />
          Current Standings
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : rankedTeams.length === 0 ? (
          <Card className="border-2 border-border">
            <CardContent className="py-8 text-center text-smoke text-sm font-semibold">
              No teams yet. <Link href="/admin/teams" className="underline text-flame font-bold">Add teams</Link> to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {rankedTeams.map((team, i) => (
              <Card key={team.id} className="overflow-hidden border-2 border-border bg-white">
                <div className="flex items-center">
                  <div className="w-2 h-full self-stretch" style={{ backgroundColor: team.color }} />
                  <CardContent className="flex-1 py-3 px-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg w-8 text-center font-black">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                      </span>
                      <span className="font-bold">{team.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-semibold text-smoke hidden sm:flex gap-2">
                        <span>+{team.gamePoints} games</span>
                        {team.missionPoints > 0 && <span>+{team.missionPoints} missions</span>}
                        {team.deductionPoints > 0 && <span className="text-destructive">-{team.deductionPoints} deducted</span>}
                      </div>
                      <Badge
                        className="font-black text-white border-0"
                        style={{ backgroundColor: team.color }}
                      >
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
