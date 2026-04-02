"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Team, Member, MemberRole } from "@/lib/types";
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
import { Plus, Pencil, Trash2, UserPlus, ChevronDown, ChevronUp } from "lucide-react";

const TEAM_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

const ROLES: MemberRole[] = ["Leader", "Assistant Leader", "Member"];

type TeamWithMembers = Team & { members: Member[] };

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  // Team form state
  const [teamDialog, setTeamDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamColor, setTeamColor] = useState(TEAM_COLORS[0]);
  const [saving, setSaving] = useState(false);

  // Member form state
  const [memberDialog, setMemberDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberTeamId, setMemberTeamId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState<MemberRole>("Member");

  const supabase = createClient();

  async function fetchData() {
    const { data: teamsData } = await supabase.from("teams").select("*").order("created_at");
    const { data: membersData } = await supabase.from("members").select("*").order("created_at");
    const merged: TeamWithMembers[] = (teamsData ?? []).map((t) => ({
      ...t,
      members: (membersData ?? []).filter((m) => m.team_id === t.id),
    }));
    setTeams(merged);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ── Team CRUD ──────────────────────────────────────────
  function openAddTeam() {
    setEditingTeam(null);
    setTeamName("");
    setTeamColor(TEAM_COLORS[teams.length % TEAM_COLORS.length]);
    setTeamDialog(true);
  }

  function openEditTeam(team: Team) {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamColor(team.color);
    setTeamDialog(true);
  }

  async function saveTeam() {
    if (!teamName.trim()) return;
    setSaving(true);
    if (editingTeam) {
      const { error } = await supabase
        .from("teams")
        .update({ name: teamName.trim(), color: teamColor })
        .eq("id", editingTeam.id);
      if (error) toast.error("Failed to update team");
      else toast.success("Team updated!");
    } else {
      const { error } = await supabase
        .from("teams")
        .insert({ name: teamName.trim(), color: teamColor });
      if (error) toast.error("Failed to create team");
      else toast.success("Team created!");
    }
    setSaving(false);
    setTeamDialog(false);
    fetchData();
  }

  async function deleteTeam(team: Team) {
    if (!confirm(`Delete team "${team.name}"? This will also remove all their scores and members.`)) return;
    const { error } = await supabase.from("teams").delete().eq("id", team.id);
    if (error) toast.error("Failed to delete team");
    else toast.success("Team deleted");
    fetchData();
  }

  // ── Member CRUD ──────────────────────────────────────────
  function openAddMember(teamId: string) {
    setEditingMember(null);
    setMemberTeamId(teamId);
    setMemberName("");
    setMemberRole("Member");
    setMemberDialog(true);
  }

  function openEditMember(member: Member) {
    setEditingMember(member);
    setMemberTeamId(member.team_id);
    setMemberName(member.name);
    setMemberRole(member.role);
    setMemberDialog(true);
  }

  async function saveMember() {
    if (!memberName.trim()) return;
    setSaving(true);
    if (editingMember) {
      const { error } = await supabase
        .from("members")
        .update({ name: memberName.trim(), role: memberRole })
        .eq("id", editingMember.id);
      if (error) toast.error("Failed to update member");
      else toast.success("Member updated!");
    } else {
      const { error } = await supabase
        .from("members")
        .insert({ team_id: memberTeamId, name: memberName.trim(), role: memberRole });
      if (error) toast.error("Failed to add member");
      else toast.success("Member added!");
    }
    setSaving(false);
    setMemberDialog(false);
    fetchData();
  }

  async function deleteMember(member: Member) {
    if (!confirm(`Remove "${member.name}" from team?`)) return;
    const { error } = await supabase.from("members").delete().eq("id", member.id);
    if (error) toast.error("Failed to remove member");
    else toast.success("Member removed");
    fetchData();
  }

  const roleColor: Record<MemberRole, string> = {
    "Leader": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Assistant Leader": "bg-blue-100 text-blue-800 border-blue-200",
    "Member": "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Teams & Members</h1>
          <p className="text-smoke text-sm font-semibold">{teams.length} teams · {teams.reduce((s, t) => s + t.members.length, 0)} members</p>
        </div>
        <Button onClick={openAddTeam} className="gap-2 bg-flame hover:bg-ember text-white font-bold">
          <Plus className="h-4 w-4" /> Add Team
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No teams yet. Click <strong>Add Team</strong> to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <Card key={team.id} className="overflow-hidden">
              <div className="h-1.5 w-full" style={{ backgroundColor: team.color }} />
              <CardHeader className="py-3 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2" style={{ backgroundColor: team.color + "30", borderColor: team.color }} />
                    <div>
                      <CardTitle className="text-base">{team.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{team.members.length} member{team.members.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openAddMember(team.id)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditTeam(team)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteTeam(team)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                    >
                      {expandedTeam === team.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedTeam === team.id && (
                <CardContent className="pt-0 pb-4 px-5">
                  {team.members.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No members yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {team.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{member.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${roleColor[member.role]}`}>
                              {member.role}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditMember(member)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteMember(member)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={() => openAddMember(team.id)}>
                    <UserPlus className="h-3.5 w-3.5" /> Add Member
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Team Dialog */}
      <Dialog open={teamDialog} onOpenChange={setTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? "Edit Team" : "Add New Team"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Team Name</Label>
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Team Fire"
                onKeyDown={(e) => e.key === "Enter" && saveTeam()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Team Color</Label>
              <div className="flex gap-2 flex-wrap">
                {TEAM_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full transition-transform ${teamColor === color ? "ring-2 ring-offset-2 ring-black scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setTeamColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamDialog(false)}>Cancel</Button>
            <Button onClick={saveTeam} disabled={!teamName.trim() || saving}>
              {saving ? "Saving..." : editingTeam ? "Save Changes" : "Create Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Dialog */}
      <Dialog open={memberDialog} onOpenChange={setMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Member" : "Add Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Full name"
                onKeyDown={(e) => e.key === "Enter" && saveMember()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={memberRole} onValueChange={(v) => setMemberRole(v as MemberRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberDialog(false)}>Cancel</Button>
            <Button onClick={saveMember} disabled={!memberName.trim() || saving}>
              {saving ? "Saving..." : editingMember ? "Save Changes" : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
