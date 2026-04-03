"use client";

import { useScoreData } from "@/hooks/useScoreData";
import { computeTeamScores } from "@/utils/scoring";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, Gamepad2, Target, MinusCircle, Award, Trophy, ArrowRight } from "lucide-react";

export default function AdminOverview() {
  const { teams, members, games, gameScores, missions, missionCompletions, deductions, awards, loading } =
    useScoreData();

  const rankedTeams = computeTeamScores(
    teams, games, gameScores, missions, missionCompletions, deductions, awards
  );

  const quickLinks = [
    { href: "/admin/teams", label: "Teams & Members", icon: Users, count: teams.length, sub: `${members.length} members`, color: "#3B82F6" },
    { href: "/admin/games", label: "Games & Scores", icon: Gamepad2, count: games.length, sub: `${gameScores.length} scores recorded`, color: "#8B5CF6" },
    { href: "/admin/missions", label: "Missions", icon: Target, count: missions.length, sub: `${missionCompletions.length} completions`, color: "#22C55E" },
    { href: "/admin/awards", label: "Awards", icon: Award, count: awards.length, sub: `${awards.reduce((s, a) => s + a.amount, 0)} pts awarded`, color: "#16A34A" },
    { href: "/admin/deductions", label: "Deductions", icon: MinusCircle, count: deductions.length, sub: `${deductions.reduce((s, d) => s + d.amount, 0)} pts total`, color: "#DC2626" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-smoke text-sm mt-0.5">Camp Lagablab — quick summary</p>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map(({ href, label, icon: Icon, count, sub, color }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-card-hover transition-shadow cursor-pointer group shadow-card bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2" style={{ backgroundColor: `${color}10` }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-smoke">{sub}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-2xl font-extrabold tabular-nums">{count}</span>
                  <ArrowRight className="h-4 w-4 text-smoke group-hover:translate-x-0.5 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Current standings */}
      <div>
        <h2 className="font-heading text-lg font-semibold tracking-tight mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-campfire" />
          Current Standings
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : rankedTeams.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-8 text-center text-smoke text-sm">
              No teams yet. <Link href="/admin/teams" className="underline text-flame font-medium">Add teams</Link> to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {rankedTeams.map((team, i) => (
              <Card key={team.id} className="overflow-hidden shadow-card bg-white">
                <div className="flex items-center">
                  <div className="w-1.5 self-stretch" style={{ backgroundColor: team.color }} />
                  <CardContent className="flex-1 py-3 px-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-heading text-lg font-bold w-8 text-center tabular-nums">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                      </span>
                      <span className="font-medium">{team.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-smoke hidden sm:flex gap-2">
                        <span>+{team.gamePoints} games</span>
                        {team.missionPoints > 0 && <span>+{team.missionPoints} missions</span>}
                        {team.awardPoints > 0 && <span className="text-green-600">+{team.awardPoints} awards</span>}
                        {team.deductionPoints > 0 && <span className="text-destructive">-{team.deductionPoints}</span>}
                      </div>
                      <Badge
                        className="font-heading font-bold text-white border-0 tabular-nums"
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
