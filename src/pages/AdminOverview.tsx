import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Users, FolderKanban, DollarSign, Bot,
  Pause, Play, XCircle, Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clients: 0, projects: 0, revenue: 0, agentRuns: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [{ count: clientCount }, { count: projectCount }, { data: payments }, { data: logs }, { data: pj }] =
        await Promise.all([
          supabase.from("clients").select("id", { count: "exact", head: true }),
          supabase.from("projects").select("id", { count: "exact", head: true }),
          supabase.from("payments").select("amount, status"),
          supabase.from("agent_logs").select("*").order("created_at", { ascending: false }).limit(20),
          supabase.from("projects").select("*, clients(name, company)").order("created_at", { ascending: false }).limit(10),
        ]);

      const revenue = (payments || [])
        .filter((p: any) => p.status === "paid")
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

      setStats({
        clients: clientCount || 0,
        projects: projectCount || 0,
        revenue,
        agentRuns: (logs || []).length,
      });
      setRecentLogs(logs || []);
      setProjects(pj || []);
    }
    load();

    // Realtime agent log updates
    const channel = supabase
      .channel("admin-agent-logs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "agent_logs" }, (payload) => {
        setRecentLogs((prev) => [payload.new as any, ...prev.slice(0, 19)]);
        setStats((prev) => ({ ...prev, agentRuns: prev.agentRuns + 1 }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const statCards = [
    { label: "Active Clients", value: stats.clients, icon: Users, color: "text-primary" },
    { label: "Projects", value: stats.projects, icon: FolderKanban, color: "text-[hsl(200,100%,60%)]" },
    { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-[hsl(45,100%,60%)]" },
    { label: "Agent Runs", value: stats.agentRuns, icon: Bot, color: "text-[hsl(280,100%,65%)]" },
  ];

  const statusColor = (s: string) => {
    if (s === "completed" || s === "paid") return "bg-primary/20 text-primary";
    if (s === "running" || s === "in-progress") return "bg-amber-500/20 text-amber-400";
    return "bg-muted text-muted-foreground";
  };

  return (
    <DashboardLayout requireRole="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Super Admin — Command Center</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <s.icon size={20} className={s.color} />
                  </div>
                  <div className="text-2xl font-display font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Projects with controls */}
          <Card className="glass-card">
            <CardContent className="p-5">
              <h2 className="font-display font-bold mb-4 flex items-center gap-2">
                <FolderKanban size={18} className="text-primary" /> Active Projects
              </h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {projects.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{(p as any).clients?.name || "—"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColor(p.status)}>{p.status}</Badge>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => navigate(`/dashboard/project/${p.id}`)}>
                        <Eye size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-400 hover:text-amber-300">
                        <Pause size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive/80">
                        <XCircle size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
              </div>
            </CardContent>
          </Card>

          {/* Agent Activity Feed */}
          <Card className="glass-card">
            <CardContent className="p-5">
              <h2 className="font-display font-bold mb-4 flex items-center gap-2">
                <Bot size={18} className="text-[hsl(280,100%,65%)]" /> Agent Activity Feed
              </h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {recentLogs.map((log: any) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors text-sm"
                  >
                    <div className={`w-2 h-2 rounded-full ${log.status === "completed" ? "bg-primary" : log.status === "running" ? "bg-amber-400 animate-pulse" : "bg-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-xs text-primary">{log.agent_type}</span>
                      <span className="text-muted-foreground mx-1">·</span>
                      <span className="text-muted-foreground text-xs">{log.action}</span>
                    </div>
                    <span className="text-xs text-muted-foreground/50">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </motion.div>
                ))}
                {recentLogs.length === 0 && <p className="text-sm text-muted-foreground">No agent activity yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
