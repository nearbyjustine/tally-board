"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Team, Award } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Award as AwardIcon, Plus, Pencil, Trash2, Star } from "lucide-react";

export default function AwardsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTeam, setFilterTeam] = useState<string>("all");

  // Award form
  const [awardDialog, setAwardDialog] = useState(false);
  const [awardTeamId, setAwardTeamId] = useState("");
  const [awardAmount, setAwardAmount] = useState(10);
  const [awardReason, setAwardReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const supabase = createClient();

  async function fetchData() {
    const [{ data: t }, { data: a }] = await Promise.all([
      supabase.from("teams").select("*").order("created_at"),
      supabase.from("awards").select("*").order("created_at", { ascending: false }),
    ]);
    setTeams(t ?? []);
    setAwards(a ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  function openAddAward(preselectedTeamId?: string) {
    setEditingId(null);
    setAwardTeamId(preselectedTeamId ?? "");
    setAwardAmount(10);
    setAwardReason("");
    setAwardDialog(true);
  }

  function openEditAward(award: Award) {
    setEditingId(award.id);
    setAwardTeamId(award.team_id);
    setAwardAmount(award.amount);
    setAwardReason(award.reason);
    setAwardDialog(true);
  }

  async function saveAward() {
    if (!awardTeamId || !awardReason.trim() || awardAmount <= 0) return;
    setSaving(true);
    const team = teams.find((t) => t.id === awardTeamId);
    if (editingId) {
      const { error } = await supabase.from("awards").update({
        team_id: awardTeamId,
        amount: Number(awardAmount),
        reason: awardReason.trim(),
      }).eq("id", editingId);
      if (error) toast.error("Failed to update award");
      else toast.success(`Award updated for ${team?.name}`);
    } else {
      const { error } = await supabase.from("awards").insert({
        team_id: awardTeamId,
        amount: Number(awardAmount),
        reason: awardReason.trim(),
      });
      if (error) toast.error("Failed to give award");
      else toast.success(`🏆 +${awardAmount} pts awarded to ${team?.name}`);
    }
    setSaving(false);
    setAwardDialog(false);
    fetchData();
  }

  async function deleteAward(award: Award) {
    const team = teams.find((t) => t.id === award.team_id);
    if (!confirm(`Remove award of +${award.amount} pts from "${team?.name}"?\nReason: "${award.reason}"`)) return;
    const { error } = await supabase.from("awards").delete().eq("id", award.id);
    if (error) toast.error("Failed to remove award");
    else toast.success("Award removed");
    fetchData();
  }

  function teamAwardTotal(teamId: string) {
    return awards.filter((a) => a.team_id === teamId).reduce((s, a) => s + a.amount, 0);
  }

  const filteredAwards = filterTeam === "all"
    ? awards
    : awards.filter((a) => a.team_id === filterTeam);

  const totalAwarded = awards.reduce((s, a) => s + a.amount, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Awards</h1>
          <p className="text-smoke text-sm">{awards.length} awards · {totalAwarded} pts total awarded</p>
        </div>
        <Button onClick={() => openAddAward()} className="gap-2 bg-emerald-600 hover:bg-emerald-700 font-heading font-semibold">
          <Plus className="h-4 w-4" /> Give Award
        </Button>
      </div>

      {/* Per-team summary */}
      {!loading && teams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {teams.map((team) => {
            const total = teamAwardTotal(team.id);
            return (
              <button
                key={team.id}
                onClick={() => openAddAward(team.id)}
                className="text-left p-3 rounded-xl border-2 hover:shadow-md transition-shadow group"
                style={{ borderColor: team.color + "60" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
                  <span className="text-sm font-medium">{team.name}</span>
                </div>
                <div className="text-xl font-bold text-emerald-600">
                  {total > 0 ? `+${total}` : "0"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {awards.filter((a) => a.team_id === team.id).length} awards
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter + list */}
      <div className="flex items-center gap-3">
        <Select value={filterTeam} onValueChange={(v) => setFilterTeam(v ?? "all")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teams.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filteredAwards.length} results</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filteredAwards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            No awards yet. Recognize great teamwork!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredAwards.map((award) => {
            const team = teams.find((t) => t.id === award.team_id);
            return (
              <Card key={award.id} className="overflow-hidden">
                <div className="flex items-center">
                  <div className="w-1.5 self-stretch" style={{ backgroundColor: (team?.color ?? "#888") + "80" }} />
                  <CardContent className="flex-1 py-3 px-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AwardIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{award.reason}</span>
                          {team && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium"
                              style={{ backgroundColor: team.color }}
                            >
                              {team.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(award.created_at).toLocaleDateString("en-PH", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="text-sm font-bold bg-emerald-600 hover:bg-emerald-600">
                        +{award.amount} pts
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => openEditAward(award)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteAward(award)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Award Dialog */}
      <Dialog open={awardDialog} onOpenChange={setAwardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <AwardIcon className="h-5 w-5" /> {editingId ? "Edit Award" : "Give Award"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Team</Label>
              <Select value={awardTeamId} onValueChange={(v) => setAwardTeamId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team..." />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
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
            <div className="space-y-1.5">
              <Label>Bonus Points</Label>
              <Input
                type="number"
                value={awardAmount}
                onChange={(e) => setAwardAmount(Number(e.target.value))}
                min={1}
                placeholder="e.g. 10"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reason <span className="text-emerald-600">*</span></Label>
              <Textarea
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                placeholder="Why is this award being given?"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAwardDialog(false)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={saveAward}
              disabled={!awardTeamId || !awardReason.trim() || awardAmount <= 0 || saving}
            >
              {saving ? "Saving..." : editingId ? "Update Award" : "Give Award"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
