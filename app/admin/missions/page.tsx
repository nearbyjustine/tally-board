"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Team, Mission, MissionCompletion } from "@/lib/types";
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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Target, Check } from "lucide-react";

export default function MissionsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completions, setCompletions] = useState<MissionCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  // Mission form
  const [missionDialog, setMissionDialog] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [missionName, setMissionName] = useState("");
  const [missionPoints, setMissionPoints] = useState(50);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  async function fetchData() {
    const [{ data: t }, { data: m }, { data: c }] = await Promise.all([
      supabase.from("teams").select("*").order("created_at"),
      supabase.from("missions").select("*").order("created_at"),
      supabase.from("mission_completions").select("*"),
    ]);
    setTeams(t ?? []);
    setMissions(m ?? []);
    setCompletions(c ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  // ── Mission CRUD ──────────────────────────────────────────
  function openAddMission() {
    setEditingMission(null);
    setMissionName("");
    setMissionPoints(50);
    setMissionDialog(true);
  }

  function openEditMission(mission: Mission) {
    setEditingMission(mission);
    setMissionName(mission.name);
    setMissionPoints(mission.points);
    setMissionDialog(true);
  }

  async function saveMission() {
    if (!missionName.trim()) return;
    setSaving(true);
    const payload = { name: missionName.trim(), points: Number(missionPoints) };
    if (editingMission) {
      const { error } = await supabase.from("missions").update(payload).eq("id", editingMission.id);
      if (error) toast.error("Failed to update mission");
      else toast.success("Mission updated!");
    } else {
      const { error } = await supabase.from("missions").insert(payload);
      if (error) toast.error("Failed to create mission");
      else toast.success("Mission created!");
    }
    setSaving(false);
    setMissionDialog(false);
    fetchData();
  }

  async function deleteMission(mission: Mission) {
    if (!confirm(`Delete mission "${mission.name}"? All completions will also be removed.`)) return;
    const { error } = await supabase.from("missions").delete().eq("id", mission.id);
    if (error) toast.error("Failed to delete mission");
    else toast.success("Mission deleted");
    fetchData();
  }

  // ── Completion toggle ──────────────────────────────────────────
  async function toggleCompletion(missionId: string, teamId: string) {
    const existing = completions.find(
      (c) => c.mission_id === missionId && c.team_id === teamId
    );
    if (existing) {
      const team = teams.find((t) => t.id === teamId);
      if (!confirm(`Remove mission completion for "${team?.name}"?`)) return;
      const { error } = await supabase.from("mission_completions").delete().eq("id", existing.id);
      if (error) toast.error("Failed to remove completion");
      else toast.success("Completion removed");
    } else {
      const { error } = await supabase.from("mission_completions").insert({
        mission_id: missionId,
        team_id: teamId,
      });
      if (error) toast.error("Failed to mark completion");
      else {
        const team = teams.find((t) => t.id === teamId);
        toast.success(`✅ ${team?.name} completed mission!`);
      }
    }
    fetchData();
  }

  function isCompleted(missionId: string, teamId: string) {
    return completions.some((c) => c.mission_id === missionId && c.team_id === teamId);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Missions</h1>
          <p className="text-smoke text-sm font-semibold">{missions.length} missions · {completions.length} completions total</p>
        </div>
        <Button onClick={openAddMission} className="gap-2 bg-flame hover:bg-ember text-white font-bold">
          <Plus className="h-4 w-4" /> Add Mission
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : missions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No missions yet. Click <strong>Add Mission</strong> to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {missions.map((mission) => {
            const completedCount = completions.filter((c) => c.mission_id === mission.id).length;
            return (
              <Card key={mission.id} className="overflow-hidden">
                <CardHeader className="py-3 px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-green-500" />
                      <div>
                        <CardTitle className="text-base">{mission.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">+{mission.points} pts per team</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={completedCount === teams.length && teams.length > 0 ? "default" : "secondary"}>
                        {completedCount}/{teams.length} teams
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => openEditMission(mission)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMission(mission)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedMission(expandedMission === mission.id ? null : mission.id)}
                      >
                        {expandedMission === mission.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedMission === mission.id && (
                  <CardContent className="pt-0 pb-4 px-5">
                    {teams.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No teams yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {teams.map((team) => {
                          const done = isCompleted(mission.id, team.id);
                          return (
                            <button
                              key={team.id}
                              onClick={() => toggleCompletion(mission.id, team.id)}
                              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                                done
                                  ? "border-green-400 bg-green-50 dark:bg-green-950"
                                  : "border-dashed border-muted-foreground/30 hover:border-muted-foreground/60"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
                                <span className={`text-sm font-medium ${done ? "text-green-700 dark:text-green-300" : ""}`}>
                                  {team.name}
                                </span>
                              </div>
                              {done ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <span className="text-xs text-muted-foreground">Tap to mark</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Mission Dialog */}
      <Dialog open={missionDialog} onOpenChange={setMissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMission ? "Edit Mission" : "Add New Mission"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Mission Name</Label>
              <Input
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                placeholder="e.g. Complete the scavenger hunt"
                onKeyDown={(e) => e.key === "Enter" && saveMission()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Points on Completion</Label>
              <Input
                type="number"
                value={missionPoints}
                onChange={(e) => setMissionPoints(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMissionDialog(false)}>Cancel</Button>
            <Button onClick={saveMission} disabled={!missionName.trim() || saving}>
              {saving ? "Saving..." : editingMission ? "Save Changes" : "Create Mission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
