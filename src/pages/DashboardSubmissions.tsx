import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Clock, Eye, DollarSign, Calendar, Layers } from "lucide-react";

interface Submission {
  id: string;
  user_id: string;
  project_name: string;
  project_type: string;
  description: string;
  budget_range: string | null;
  timeline: string | null;
  features: string | null;
  tech_requirements: string | null;
  status: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending Review", class: "bg-amber-500/20 text-amber-400" },
  reviewing: { label: "Under Review", class: "bg-blue-500/20 text-blue-400" },
  approved: { label: "Approved", class: "bg-primary/20 text-primary" },
  rejected: { label: "Rejected", class: "bg-destructive/20 text-destructive" },
};

export default function DashboardSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase
      .from("project_submissions")
      .select("*, profiles:user_id(full_name)")
      .order("created_at", { ascending: false });
    setSubmissions((data as any[]) ?? []);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("project_submissions").update({ status } as any).eq("id", id);
    load();
    toast({ title: `Submission ${status}` });
  };

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <DashboardLayout requireRole="admin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Project Submissions</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-primary font-semibold">{pendingCount}</span> pending reviews
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {submissions.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No project submissions yet.</p>
        )}
        {submissions.map((sub) => (
          <Card key={sub.id} className="glass-card hover:border-primary/20 transition-colors">
            <CardContent className="py-4 px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <p className="font-semibold truncate">{sub.project_name}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span><Layers className="h-3 w-3 inline mr-1" />{sub.project_type}</span>
                    <span>{(sub as any).profiles?.full_name ?? "Unknown user"}</span>
                    <span><Clock className="h-3 w-3 inline mr-1" />{new Date(sub.created_at).toLocaleDateString()}</span>
                    {sub.budget_range && <span><DollarSign className="h-3 w-3 inline mr-1" />{sub.budget_range}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={sub.status} onValueChange={(v) => handleStatusChange(sub.id, v)}>
                    <SelectTrigger className={`w-[140px] border-0 text-xs font-medium ${statusConfig[sub.status]?.class ?? ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => setSelected(sub)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.project_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Submitted by</p>
                  <p className="font-medium">{(selected as any).profiles?.full_name ?? "Unknown"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{selected.project_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-medium">{selected.budget_range || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Timeline</p>
                  <p className="font-medium">{selected.timeline || "Not specified"}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-1">Description</p>
                <div className="bg-secondary/50 rounded-lg p-3 text-sm whitespace-pre-wrap">{selected.description}</div>
              </div>

              {selected.features && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Required Features</p>
                  <div className="bg-secondary/50 rounded-lg p-3 text-sm whitespace-pre-wrap">{selected.features}</div>
                </div>
              )}

              {selected.tech_requirements && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Technical Requirements</p>
                  <div className="bg-secondary/50 rounded-lg p-3 text-sm whitespace-pre-wrap">{selected.tech_requirements}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
