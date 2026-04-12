import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Clock, FolderKanban, MessageSquare, Plus } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;
type Milestone = Tables<"milestones">;

export default function ClientPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Record<string, Milestone[]>>({});
  const [hasSubmissions, setHasSubmissions] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;

      // Check if user has any submissions
      const { count } = await supabase
        .from("project_submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setHasSubmissions((count ?? 0) > 0);

      // Get client record for this user
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      const { data: pj } = client
        ? await supabase.from("projects").select("*").eq("client_id", client.id).order("created_at", { ascending: false })
        : { data: [] as Project[] };
      setProjects(pj ?? []);

      if (pj && pj.length > 0) {
        const { data: ms } = await supabase
          .from("milestones")
          .select("*")
          .in("project_id", pj.map((p) => p.id))
          .order("due_date", { ascending: true });

        const grouped: Record<string, Milestone[]> = {};
        (ms ?? []).forEach((m) => {
          if (!grouped[m.project_id]) grouped[m.project_id] = [];
          grouped[m.project_id].push(m);
        });
        setMilestones(grouped);
      }
    }
    load();
  }, [user]);

  const statusIcon = (s: string) => {
    if (s === "completed") return <CheckCircle2 className="h-4 w-4 text-primary" />;
    if (s === "in-progress") return <Clock className="h-4 w-4 text-amber-400" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "bg-primary/20 text-primary";
    if (s === "in-progress") return "bg-amber-500/20 text-amber-400";
    if (s === "review") return "bg-purple-500/20 text-purple-400";
    return "bg-muted text-muted-foreground";
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold">My Projects</h1>
        <Button
          onClick={() => navigate("/portal/submit")}
          className="bg-primary text-primary-foreground hover:brightness-110"
        >
          <Plus className="mr-2 h-4 w-4" /> Submit New Project
        </Button>
      </div>

      {!hasSubmissions && projects.length === 0 && (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Welcome! Let's get started.</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Submit your project details and our team will review your requirements and get back to you within 24 hours.
            </p>
            <Button
              onClick={() => navigate("/portal/submit")}
              className="bg-primary text-primary-foreground"
            >
              <Plus className="mr-2 h-4 w-4" /> Submit Your First Project
            </Button>
          </CardContent>
        </Card>
      )}

      <Accordion type="multiple" className="space-y-4">
        {projects.map((p) => (
          <AccordionItem key={p.id} value={p.id} className="glass-card border-border rounded-2xl overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3 text-left flex-1">
                <FolderKanban className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{p.title}</p>
                  {p.description && <p className="text-sm text-muted-foreground truncate">{p.description}</p>}
                </div>
                <Badge className={`ml-4 shrink-0 ${statusColor(p.status)}`}>{p.status}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">Milestones</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/portal/project/${p.id}`)}
                  className="text-primary text-xs"
                >
                  <MessageSquare className="h-3 w-3 mr-1" /> Open Discussion
                </Button>
              </div>
              {(!milestones[p.id] || milestones[p.id].length === 0) && (
                <p className="text-sm text-muted-foreground">No milestones yet.</p>
              )}
              <div className="space-y-2">
                {(milestones[p.id] ?? []).map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                      {statusIcon(m.status)}
                      <span className="text-sm">{m.title}</span>
                    </div>
                    {m.due_date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(m.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </DashboardLayout>
  );
}
