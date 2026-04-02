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
    <div className="min-h-screen bg-warmwhite">
      {/* Header */}
      <header className="bg-charcoal sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-flame rounded-xl p-2.5">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">
                Lagablab
              </h1>
              <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">
                Youth Camp Scoreboard
              </p>
            </div>
          </div>
          <a
            href="/admin"
            className="flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-white/80 transition-colors uppercase tracking-wide"
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
              <div key={i} className="h-36 rounded-2xl bg-white animate-pulse border-2 border-border" />
            ))}
          </div>
        ) : rankedTeams.length === 0 ? (
          <div className="text-center py-24">
            <div className="bg-flame/10 rounded-full p-6 w-fit mx-auto mb-5">
              <Flame className="h-16 w-16 text-flame" />
            </div>
            <h2 className="text-xl font-extrabold text-ash">No teams yet</h2>
            <p className="text-sm font-medium text-smoke mt-2">
              Head to the admin panel to set up teams and games.
            </p>
          </div>
        ) : (
          <>
            {/* Live badge */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-ash">
                Live Standings
              </h2>
              <span className="flex items-center gap-2 text-xs font-bold text-flame uppercase tracking-wide">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-flame opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-flame" />
                </span>
                Live
              </span>
            </div>

            {/* Team cards */}
            <div className="space-y-4">
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
            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border-2 border-border text-center">
                <Trophy className="h-5 w-5 text-campfire mx-auto mb-2" />
                <div className="text-3xl font-black text-ash">{games.length}</div>
                <div className="text-[11px] font-bold text-smoke uppercase tracking-wide mt-1">Games</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border-2 border-border text-center">
                <Target className="h-5 w-5 text-flame mx-auto mb-2" />
                <div className="text-3xl font-black text-ash">{missionCompletions.length}</div>
                <div className="text-[11px] font-bold text-smoke uppercase tracking-wide mt-1">Missions</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border-2 border-border text-center">
                <Users className="h-5 w-5 text-ember mx-auto mb-2" />
                <div className="text-3xl font-black text-ash">{members.length}</div>
                <div className="text-[11px] font-bold text-smoke uppercase tracking-wide mt-1">Campers</div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
