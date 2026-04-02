"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Team, Deduction } from "@/lib/types";
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
import { MinusCircle, Plus, Trash2, AlertTriangle } from "lucide-react";

export default function DeductionsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTeam, setFilterTeam] = useState<string>("all");

  // Deduction form
  const [deductionDialog, setDeductionDialog] = useState(false);
  const [deductTeamId, setDeductTeamId] = useState("");
  const [deductAmount, setDeductAmount] = useState(10);
  const [deductReason, setDeductReason] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  async function fetchData() {
    const [{ data: t }, { data: d }] = await Promise.all([
      supabase.from("teams").select("*").order("created_at"),
      supabase.from("deductions").select("*").order("created_at", { ascending: false }),
    ]);
    setTeams(t ?? []);
    setDeductions(d ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  function openAddDeduction(preselectedTeamId?: string) {
    setDeductTeamId(preselectedTeamId ?? "");
    setDeductAmount(10);
    setDeductReason("");
    setDeductionDialog(true);
  }

  async function saveDeduction() {
    if (!deductTeamId || !deductReason.trim() || deductAmount <= 0) return;
    setSaving(true);
    const { error } = await supabase.from("deductions").insert({
      team_id: deductTeamId,
      amount: Number(deductAmount),
      reason: deductReason.trim(),
    });
    if (error) toast.error("Failed to apply deduction");
    else {
      const team = teams.find((t) => t.id === deductTeamId);
      toast.warning(`⚠️ -${deductAmount} pts applied to ${team?.name}`);
    }
    setSaving(false);
    setDeductionDialog(false);
    fetchData();
  }

  async function deleteDeduction(deduction: Deduction) {
    const team = teams.find((t) => t.id === deduction.team_id);
    if (!confirm(`Remove deduction of -${deduction.amount} pts from "${team?.name}"?\nReason: "${deduction.reason}"`)) return;
    const { error } = await supabase.from("deductions").delete().eq("id", deduction.id);
    if (error) toast.error("Failed to remove deduction");
    else toast.success("Deduction removed");
    fetchData();
  }

  // Stats per team
  function teamDeductionTotal(teamId: string) {
    return deductions.filter((d) => d.team_id === teamId).reduce((s, d) => s + d.amount, 0);
  }

  const filteredDeductions = filterTeam === "all"
    ? deductions
    : deductions.filter((d) => d.team_id === filterTeam);

  const totalDeducted = deductions.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deductions</h1>
          <p className="text-muted-foreground text-sm">{deductions.length} deductions · {totalDeducted} pts total removed</p>
        </div>
        <Button onClick={() => openAddDeduction()} className="gap-2 bg-destructive hover:bg-destructive/90">
          <Plus className="h-4 w-4" /> Apply Deduction
        </Button>
      </div>

      {/* Per-team summary */}
      {!loading && teams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {teams.map((team) => {
            const total = teamDeductionTotal(team.id);
            return (
              <button
                key={team.id}
                onClick={() => openAddDeduction(team.id)}
                className="text-left p-3 rounded-xl border-2 hover:shadow-md transition-shadow group"
                style={{ borderColor: team.color + "60" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
                  <span className="text-sm font-medium">{team.name}</span>
                </div>
                <div className="text-xl font-bold text-destructive">
                  {total > 0 ? `-${total}` : "0"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {deductions.filter((d) => d.team_id === team.id).length} deductions
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
        <span className="text-sm text-muted-foreground">{filteredDeductions.length} results</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filteredDeductions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            No deductions yet. Keep it that way! 🎉
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredDeductions.map((deduction) => {
            const team = teams.find((t) => t.id === deduction.team_id);
            return (
              <Card key={deduction.id} className="overflow-hidden">
                <div className="flex items-center">
                  <div className="w-1.5 self-stretch" style={{ backgroundColor: (team?.color ?? "#888") + "80" }} />
                  <CardContent className="flex-1 py-3 px-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MinusCircle className="h-4 w-4 text-destructive shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{deduction.reason}</span>
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
                          {new Date(deduction.created_at).toLocaleDateString("en-PH", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive" className="text-sm font-bold">
                        -{deduction.amount} pts
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteDeduction(deduction)}
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

      {/* Deduction Dialog */}
      <Dialog open={deductionDialog} onOpenChange={setDeductionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Apply Deduction
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Team</Label>
              <Select value={deductTeamId} onValueChange={(v) => setDeductTeamId(v ?? "")}>
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
              <Label>Points to Deduct</Label>
              <Input
                type="number"
                value={deductAmount}
                onChange={(e) => setDeductAmount(Number(e.target.value))}
                min={1}
                placeholder="e.g. 10"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reason <span className="text-destructive">*</span></Label>
              <Textarea
                value={deductReason}
                onChange={(e) => setDeductReason(e.target.value)}
                placeholder="Why is this deduction being applied?"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeductionDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={saveDeduction}
              disabled={!deductTeamId || !deductReason.trim() || deductAmount <= 0 || saving}
            >
              {saving ? "Saving..." : "Apply Deduction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
