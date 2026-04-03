"use client";

import { useScoreData } from "@/hooks/useScoreData";
import { computeTeamScores } from "@/utils/scoring";
import { TeamColumn } from "@/components/dashboard/TeamColumn";
import { Flame, Shield } from "lucide-react";

export default function Dashboard() {
  const { teams, members, games, gameScores, missions, missionCompletions, deductions, awards, teamImages, loading } =
    useScoreData();

  const rankedTeams = computeTeamScores(
    teams,
    games,
    gameScores,
    missions,
    missionCompletions,
    deductions,
    awards
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-charcoal relative">
      {/* Floating header */}
      <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="bg-flame rounded-lg p-1.5">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-sm font-bold text-white/90 tracking-tight">
                Lagablab
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4 pointer-events-auto">
            <span className="flex items-center gap-2 text-[11px] font-medium text-white/50 uppercase tracking-wide">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Live
            </span>
            <a
              href="/admin"
              className="flex items-center gap-1 text-[11px] font-medium text-white/30 hover:text-white/60 transition-colors"
            >
              <Shield className="h-3 w-3" />
              Admin
            </a>
          </div>
        </div>
      </header>

      {loading ? (
        /* Loading state */
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-flame rounded-xl p-3 animate-pulse">
              <Flame className="h-8 w-8 text-white" />
            </div>
            <p className="text-white/40 text-sm font-medium">Loading scores...</p>
          </div>
        </div>
      ) : rankedTeams.length === 0 ? (
        /* Empty state */
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white/5 rounded-2xl p-6 w-fit mx-auto mb-5">
              <Flame className="h-14 w-14 text-flame" />
            </div>
            <h2 className="font-heading text-xl font-bold text-white">No teams yet</h2>
            <p className="text-sm text-white/40 mt-2">
              Head to the admin panel to set up teams and games.
            </p>
          </div>
        </div>
      ) : (
        /* Team columns */
        <div className="h-full flex flex-row overflow-x-auto snap-x snap-mandatory md:overflow-hidden md:snap-none">
          {rankedTeams.map((team, i) => (
            <TeamColumn
              key={team.id}
              team={team}
              images={teamImages.filter((img) => img.team_id === team.id)}
              index={i}
              total={rankedTeams.length}
            />
          ))}
        </div>
      )}

      {/* Mobile scroll indicator */}
      {!loading && rankedTeams.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 md:hidden">
          <div className="text-[10px] font-medium text-white/30 uppercase tracking-widest animate-pulse">
            Swipe
          </div>
        </div>
      )}
    </div>
  );
}
