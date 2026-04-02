"use client";

import { useScoreData } from "@/hooks/useScoreData";
import { computeTeamScores } from "@/utils/scoring";
import { TeamCard } from "@/components/dashboard/TeamCard";
import { Flame, Shield } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 dark:from-orange-950 dark:via-amber-950 dark:to-red-950">
      <header className="border-b bg-white/80 dark:bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-2">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Lagablab
              </h1>
              <p className="text-xs text-muted-foreground">Youth Camp Scoreboard</p>
            </div>
          </div>
          <a
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
              <div key={i} className="h-32 rounded-xl bg-white/60 animate-pulse" />
            ))}
          </div>
        ) : rankedTeams.length === 0 ? (
          <div className="text-center py-24">
            <Flame className="h-16 w-16 mx-auto text-orange-200 mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground">No teams yet</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Head to the admin panel to set up teams and games.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Live Standings</h2>
              <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>

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

            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/60 dark:bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold">{games.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Games Played</div>
              </div>
              <div className="bg-white/60 dark:bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold">{missionCompletions.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Missions Done</div>
              </div>
              <div className="bg-white/60 dark:bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold">{members.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Campers</div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
