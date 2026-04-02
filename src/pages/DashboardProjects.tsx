import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Eye } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects"> & { clients?: { name: string } | null };
type Client = Tables<"clients">;

const statusColors: Record<string, string> = {
  planning: "bg-blue-500/20 text-blue-400",
  "in-progress": "bg-amber-500/20 text-amber-400",
  review: "bg-purple-500/20 text-purple-400",
  completed: "bg-primary/20 text-primary",
};

export default function DashboardProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", client_id: "", status: "planning" });
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("projects").select("*, clients(name)").order("created_at", { ascending: false });
    setProjects((data as Project[]) ?? []);
    const { data: cl } = await supabase.from("clients").select("*").eq("status", "active");
    setClients(cl ?? []);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("projects").insert(form);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Project created" });
    setForm({ title: "", description: "", client_id: "", status: "planning" });
    setOpen(false);
    load();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("projects").update({ status }).eq("id", id);
    load();
  };

  return (
    <DashboardLayout requireRole="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Projects</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:brightness-110">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="bg-secondary border-border" />
              <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border" />
              <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select client *" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={!form.client_id}>Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {projects.length === 0 && <p className="text-muted-foreground">No projects yet.</p>}
        {projects.map((p) => (
          <Card key={p.id} className="glass-card hover:border-primary/20 transition-colors">
            <CardContent className="flex items-center justify-between py-4 px-6">
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-muted-foreground">{p.clients?.name ?? "No client"} {p.description && `· ${p.description}`}</p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={p.status} onValueChange={(v) => handleStatusChange(p.id, v)}>
                  <SelectTrigger className={`w-[130px] border-0 text-xs font-medium ${statusColors[p.status] ?? ""}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/dashboard/project/${p.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
