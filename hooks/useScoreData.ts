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
  Member,
} from "@/lib/types";

export interface ScoreData {
  teams: Team[];
  members: Member[];
  games: Game[];
  gameScores: GameScore[];
  missions: Mission[];
  missionCompletions: MissionCompletion[];
  deductions: Deduction[];
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
    ] = await Promise.all([
      supabase.from("teams").select("*").order("created_at"),
      supabase.from("members").select("*").order("created_at"),
      supabase.from("games").select("*").order("created_at"),
      supabase.from("game_scores").select("*"),
      supabase.from("missions").select("*").order("created_at"),
      supabase.from("mission_completions").select("*"),
      supabase.from("deductions").select("*").order("created_at"),
    ]);

    setData({
      teams: teams ?? [],
      members: members ?? [],
      games: games ?? [],
      gameScores: gameScores ?? [],
      missions: missions ?? [],
      missionCompletions: missionCompletions ?? [],
      deductions: deductions ?? [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    const supabase = createClient();
    const tables = [
      "teams",
      "members",
      "games",
      "game_scores",
      "missions",
      "mission_completions",
      "deductions",
    ];

    const channel = supabase
      .channel("realtime:all")
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "games" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "game_scores" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "missions" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "mission_completions" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "deductions" }, fetchAll)
      .subscribe();

    // Suppress unused variable warning
    void tables;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  return { ...data, loading };
}
