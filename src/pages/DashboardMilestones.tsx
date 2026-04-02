import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Milestone = Tables<"milestones"> & { projects?: { title: string } | null };
type Project = Tables<"projects">;

export default function DashboardMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", project_id: "", due_date: "" });
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("milestones").select("*, projects(title)").order("due_date", { ascending: true });
    setMilestones((data as Milestone[]) ?? []);
    const { data: pj } = await supabase.from("projects").select("*");
    setProjects(pj ?? []);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const insert: any = { title: form.title, description: form.description || null, project_id: form.project_id };
    if (form.due_date) insert.due_date = form.due_date;
    const { error } = await supabase.from("milestones").insert(insert);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Milestone created" });
    setForm({ title: "", description: "", project_id: "", due_date: "" });
    setOpen(false);
    load();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("milestones").update({ status }).eq("id", id);
    load();
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "bg-primary/20 text-primary";
    if (s === "in-progress") return "bg-amber-500/20 text-amber-400";
    return "bg-muted text-muted-foreground";
  };

  return (
    <DashboardLayout requireRole="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Milestones</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:brightness-110">
              <Plus className="mr-2 h-4 w-4" /> New Milestone
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>New Milestone</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="bg-secondary border-border" />
              <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border" />
              <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select project *" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="bg-secondary border-border" />
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={!form.project_id}>Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {milestones.length === 0 && <p className="text-muted-foreground">No milestones yet.</p>}
        {milestones.map((m) => (
          <Card key={m.id} className="glass-card">
            <CardContent className="flex items-center justify-between py-4 px-6">
              <div>
                <p className="font-semibold">{m.title}</p>
                <p className="text-sm text-muted-foreground">
                  {m.projects?.title ?? "No project"}
                  {m.due_date && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(m.due_date).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <Select value={m.status} onValueChange={(v) => handleStatusChange(m.id, v)}>
                <SelectTrigger className={`w-[130px] border-0 text-xs font-medium ${statusColor(m.status)}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
