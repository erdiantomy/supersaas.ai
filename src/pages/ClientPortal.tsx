import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Clock, FolderKanban } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;
type Milestone = Tables<"milestones">;

export default function ClientPortal() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Record<string, Milestone[]>>({});

  useEffect(() => {
    async function load() {
      const { data: pj } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
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
  }, []);

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
      <h1 className="text-2xl font-display font-bold mb-6">My Projects</h1>

      {projects.length === 0 && (
        <p className="text-muted-foreground">No projects assigned to you yet.</p>
      )}

      <Accordion type="multiple" className="space-y-4">
        {projects.map((p) => (
          <AccordionItem key={p.id} value={p.id} className="glass-card border-border rounded-2xl overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <FolderKanban className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{p.title}</p>
                  {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                </div>
                <Badge className={`ml-4 ${statusColor(p.status)}`}>{p.status}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <p className="text-sm text-muted-foreground mb-3">Milestones</p>
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
