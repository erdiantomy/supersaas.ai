import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderKanban, Milestone, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, projects: 0, milestones: 0, completed: 0 });

  useEffect(() => {
    async function load() {
      const [c, p, m, done] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("milestones").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "completed"),
      ]);
      setStats({
        clients: c.count ?? 0,
        projects: p.count ?? 0,
        milestones: m.count ?? 0,
        completed: done.count ?? 0,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Clients", value: stats.clients, icon: Users, color: "text-primary" },
    { label: "Projects", value: stats.projects, icon: FolderKanban, color: "text-blue-400" },
    { label: "Milestones", value: stats.milestones, icon: Milestone, color: "text-amber-400" },
    { label: "Completed", value: stats.completed, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <DashboardLayout requireRole="admin">
      <h1 className="text-2xl font-display font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
