"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type {
  Team,
  Game,
  GameScore,
  Mission,
  MissionCompletion,
  Deduction,
  Award,
  Member,
  TeamImage,
} from "@/lib/types";

export interface ScoreData {
  teams: Team[];
  members: Member[];
  games: Game[];
  gameScores: GameScore[];
  missions: Mission[];
  missionCompletions: MissionCompletion[];
  deductions: Deduction[];
  awards: Award[];
  teamImages: TeamImage[];
  loading: boolean;
}

export function useScoreData(): ScoreData {
  const [data, setData] = useState<Omit<ScoreData, "loading">>({
    teams: [],
    members: [],
    games: [],
    gameScores: [],
    missions: [],
    missionCompletions: [],
    deductions: [],
    awards: [],
    teamImages: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const [
      { data: teams },
      { data: members },
      { data: games },
      { data: gameScores },
      { data: missions },
      { data: missionCompletions },
      { data: deductions },
      { data: awards },
      { data: teamImages },
    ] = await Promise.all([
      supabase.from("teams").select("*").order("created_at"),
      supabase.from("members").select("*").order("created_at"),
      supabase.from("games").select("*").order("created_at"),
      supabase.from("game_scores").select("*"),
      supabase.from("missions").select("*").order("created_at"),
      supabase.from("mission_completions").select("*"),
      supabase.from("deductions").select("*").order("created_at"),
      supabase.from("awards").select("*").order("created_at"),
      supabase.from("team_images").select("*").order("created_at"),
    ]);

    setData({
      teams: teams ?? [],
      members: members ?? [],
      games: games ?? [],
      gameScores: gameScores ?? [],
      missions: missions ?? [],
      missionCompletions: missionCompletions ?? [],
      deductions: deductions ?? [],
      awards: awards ?? [],
      teamImages: teamImages ?? [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    const supabase = createClient();

    const channel = supabase
      .channel("realtime:all")
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "games" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "game_scores" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "missions" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "mission_completions" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "deductions" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "awards" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "team_images" }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  return { ...data, loading };
}
