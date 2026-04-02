"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Team, Game, GameScore, GameRank } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Trophy } from "lucide-react";

const RANK_LABELS = ["1st", "2nd", "3rd", "4th"];
const RANK_COLORS = ["text-yellow-500", "text-slate-400", "text-amber-600", "text-muted-foreground"];

export default function GamesPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  // Game form
  const [gameDialog, setGameDialog] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [gameName, setGameName] = useState("");
  const [points, setPoints] = useState({ "1": 100, "2": 70, "3": 50, "4": 30 });
  const [saving, setSaving] = useState(false);

  // Score assignment form
  const [scoreDialog, setScoreDialog] = useState(false);
  const [scoreGameId, setScoreGameId] = useState("");
  const [scoreRank, setScoreRank] = useState<GameRank>(1);
  const [scoreTeamId, setScoreTeamId] = useState("");

  const supabase = createClient();

  async function fetchData() {
    const [{ data: t }, { data: g }, { data: gs }] = await Promise.all([
      supabase.from("teams").select("*").order("created_at"),
      supabase.from("games").select("*").order("created_at"),
      supabase.from("game_scores").select("*"),
    ]);
    setTeams(t ?? []);
    setGames(g ?? []);
    setGameScores(gs ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  // ── Game CRUD ──────────────────────────────────────────
  function openAddGame() {
    setEditingGame(null);
    setGameName("");
    setPoints({ "1": 100, "2": 70, "3": 50, "4": 30 });
    setGameDialog(true);
  }

  function openEditGame(game: Game) {
    setEditingGame(game);
    setGameName(game.name);
    setPoints({ "1": game.points_1st, "2": game.points_2nd, "3": game.points_3rd, "4": game.points_4th });
    setGameDialog(true);
  }

  async function saveGame() {
    if (!gameName.trim()) return;
    setSaving(true);
    const payload = {
      name: gameName.trim(),
      points_1st: Number(points["1"]),
      points_2nd: Number(points["2"]),
      points_3rd: Number(points["3"]),
      points_4th: Number(points["4"]),
    };
    if (editingGame) {
      const { error } = await supabase.from("games").update(payload).eq("id", editingGame.id);
      if (error) toast.error("Failed to update game");
      else toast.success("Game updated!");
    } else {
      const { error } = await supabase.from("games").insert(payload);
      if (error) toast.error("Failed to create game");
      else toast.success("Game created!");
    }
    setSaving(false);
    setGameDialog(false);
    fetchData();
  }

  async function deleteGame(game: Game) {
    if (!confirm(`Delete game "${game.name}"? All associated scores will be removed.`)) return;
    const { error } = await supabase.from("games").delete().eq("id", game.id);
    if (error) toast.error("Failed to delete game");
    else toast.success("Game deleted");
    fetchData();
  }

  // ── Score assignment ──────────────────────────────────────────
  function openAssignScore(gameId: string, rank: GameRank) {
    setScoreGameId(gameId);
    setScoreRank(rank);
    // Pre-select existing team for this rank if any
    const existing = gameScores.find((gs) => gs.game_id === gameId && gs.rank === rank);
    setScoreTeamId(existing?.team_id ?? "");
    setScoreDialog(true);
  }

  async function saveScore() {
    if (!scoreTeamId) return;
    setSaving(true);
    // Upsert: remove existing score for this game+rank AND this game+team first
    await supabase.from("game_scores").delete().match({ game_id: scoreGameId, rank: scoreRank });
    await supabase.from("game_scores").delete().match({ game_id: scoreGameId, team_id: scoreTeamId });

    const { error } = await supabase.from("game_scores").insert({
      game_id: scoreGameId,
      team_id: scoreTeamId,
      rank: scoreRank,
    });
    if (error) toast.error("Failed to assign score");
    else toast.success(`${RANK_LABELS[scoreRank - 1]} place assigned!`);
    setSaving(false);
    setScoreDialog(false);
    fetchData();
  }

  async function removeScore(gs: GameScore) {
    const team = teams.find((t) => t.id === gs.team_id);
    const game = games.find((g) => g.id === gs.game_id);
    if (!confirm(`Remove ${RANK_LABELS[gs.rank - 1]} place for "${team?.name}" in "${game?.name}"?`)) return;
    await supabase.from("game_scores").delete().eq("id", gs.id);
    toast.success("Score removed");
    fetchData();
  }

  function getScoreForRank(gameId: string, rank: GameRank) {
    const gs = gameScores.find((s) => s.game_id === gameId && s.rank === rank);
    if (!gs) return null;
    return teams.find((t) => t.id === gs.team_id) ?? null;
  }

  // Teams not yet assigned any rank in this game
  function availableTeamsForScore(gameId: string) {
    const assignedTeamIds = gameScores
      .filter((gs) => gs.game_id === gameId && gs.rank !== scoreRank)
      .map((gs) => gs.team_id);
    return teams.filter((t) => !assignedTeamIds.includes(t.id));
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Games & Scores</h1>
          <p className="text-smoke text-sm">{games.length} games · {gameScores.length} scores recorded</p>
        </div>
        <Button onClick={openAddGame} className="gap-2 bg-flame hover:bg-ember text-white font-heading font-semibold">
          <Plus className="h-4 w-4" /> Add Game
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : games.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No games yet. Click <strong>Add Game</strong> to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {games.map((game) => {
            const gameScoreCount = gameScores.filter((gs) => gs.game_id === game.id).length;
            return (
              <Card key={game.id} className="overflow-hidden">
                <CardHeader className="py-3 px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <div>
                        <CardTitle className="text-base">{game.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Points: 1st={game.points_1st} · 2nd={game.points_2nd} · 3rd={game.points_3rd} · 4th={game.points_4th}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={gameScoreCount === 4 ? "default" : "secondary"}>
                        {gameScoreCount}/4 ranked
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => openEditGame(game)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteGame(game)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
                      >
                        {expandedGame === game.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedGame === game.id && (
                  <CardContent className="pt-0 pb-4 px-5">
                    <div className="grid grid-cols-2 gap-2">
                      {([1, 2, 3, 4] as GameRank[]).map((rank) => {
                        const team = getScoreForRank(game.id, rank);
                        const rankKey = (["points_1st", "points_2nd", "points_3rd", "points_4th"] as const)[rank - 1];
                        return (
                          <div
                            key={rank}
                            className={`flex items-center justify-between p-3 rounded-lg border-2 ${team ? "border-current/20 bg-muted/30" : "border-dashed border-muted-foreground/20"}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm ${RANK_COLORS[rank - 1]}`}>
                                {RANK_LABELS[rank - 1]}
                              </span>
                              <span className="text-xs text-muted-foreground">({game[rankKey]} pts)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {team ? (
                                <>
                                  <span
                                    className="text-sm font-medium px-2 py-0.5 rounded-full text-white text-xs"
                                    style={{ backgroundColor: team.color }}
                                  >
                                    {team.name}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                    onClick={() => removeScore(gameScores.find((gs) => gs.game_id === game.id && gs.rank === rank)!)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => openAssignScore(game.id, rank)}
                                >
                                  Assign
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Game Dialog */}
      <Dialog open={gameDialog} onOpenChange={setGameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGame ? "Edit Game" : "Add New Game"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Game Name</Label>
              <Input
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="e.g. Relay Race"
              />
            </div>
            <div className="space-y-2">
              <Label>Points per Rank</Label>
              <div className="grid grid-cols-2 gap-2">
                {([1, 2, 3, 4] as const).map((rank) => (
                  <div key={rank} className="space-y-1">
                    <Label className={`text-xs ${RANK_COLORS[rank - 1]}`}>{RANK_LABELS[rank - 1]} Place</Label>
                    <Input
                      type="number"
                      value={points[String(rank) as keyof typeof points]}
                      onChange={(e) => setPoints((p) => ({ ...p, [String(rank)]: Number(e.target.value) }))}
                      min={0}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGameDialog(false)}>Cancel</Button>
            <Button onClick={saveGame} disabled={!gameName.trim() || saving}>
              {saving ? "Saving..." : editingGame ? "Save Changes" : "Create Game"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Score Assignment Dialog */}
      <Dialog open={scoreDialog} onOpenChange={setScoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign {RANK_LABELS[scoreRank - 1]} Place
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Select Team</Label>
              <Select value={scoreTeamId} onValueChange={(v) => setScoreTeamId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a team..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTeamsForScore(scoreGameId).map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
                        {team.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScoreDialog(false)}>Cancel</Button>
            <Button onClick={saveScore} disabled={!scoreTeamId || saving}>
              {saving ? "Saving..." : "Assign Score"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
