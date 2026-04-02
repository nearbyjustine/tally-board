"use client";

import { useScoreData } from "@/hooks/useScoreData";
import { computeTeamScores } from "@/utils/scoring";
import { TeamCard } from "@/components/dashboard/TeamCard";
import { Flame, Shield, Trophy, Target, Users } from "lucide-react";

export default function Dashboard() {
  const { teams, members, games, gameScores, missions, missionCompletions, deductions, loading } =
    useScoreData();

  const rankedTeams = computeTeamScores(
    teams,
    games,
    gameScores,
    missions,
    missionCompletions,
    deductions
  );

  return (
    <div className="min-h-screen bg-warmwhite bg-dot-pattern">
      {/* Header */}
      <header className="bg-charcoal sticky top-0 z-10 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-flame rounded-xl p-2.5">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-extrabold tracking-tight text-white">
                Lagablab
              </h1>
              <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest">
                Youth Camp Scoreboard
              </p>
            </div>
          </div>
          <a
            href="/admin"
            className="flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-white/70 transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            Admin
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-white shadow-card animate-pulse" />
            ))}
          </div>
        ) : rankedTeams.length === 0 ? (
          <div className="text-center py-24">
            <div className="bg-flame/8 rounded-2xl p-6 w-fit mx-auto mb-5">
              <Flame className="h-14 w-14 text-flame" />
            </div>
            <h2 className="font-heading text-xl font-bold text-charcoal">No teams yet</h2>
            <p className="text-sm text-smoke mt-2">
              Head to the admin panel to set up teams and games.
            </p>
          </div>
        ) : (
          <>
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold tracking-tight text-charcoal">
                Live Standings
              </h2>
              <span className="flex items-center gap-2 text-xs font-medium text-flame uppercase tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-flame opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-flame" />
                </span>
                Live
              </span>
            </div>

            {/* Team cards */}
            <div className="space-y-3">
              {rankedTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  games={games}
                  gameScores={gameScores}
                  missions={missions}
                  missionCompletions={missionCompletions}
                  deductions={deductions}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-5 shadow-card text-center">
                <Trophy className="h-4 w-4 text-campfire mx-auto mb-2" />
                <div className="font-heading text-2xl font-extrabold tabular-nums text-charcoal">{games.length}</div>
                <div className="text-[11px] font-medium text-smoke uppercase tracking-wide mt-1">Games</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-card text-center">
                <Target className="h-4 w-4 text-flame mx-auto mb-2" />
                <div className="font-heading text-2xl font-extrabold tabular-nums text-charcoal">{missionCompletions.length}</div>
                <div className="text-[11px] font-medium text-smoke uppercase tracking-wide mt-1">Missions</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-card text-center">
                <Users className="h-4 w-4 text-ember mx-auto mb-2" />
                <div className="font-heading text-2xl font-extrabold tabular-nums text-charcoal">{members.length}</div>
                <div className="text-[11px] font-medium text-smoke uppercase tracking-wide mt-1">Campers</div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
