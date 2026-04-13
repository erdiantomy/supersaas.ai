import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Bot, Play, Pause, XCircle, CheckCircle, Clock,
  DollarSign, Activity, Shield, Zap, Eye, RefreshCw
} from "lucide-react";

const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-managed-agent`;

async function callManagedAgent(body: any) {
  const resp = await fetch(FUNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }
  return resp.json();
}

const statusConfig: Record<string, { color: string; icon: typeof Play }> = {
  running: { color: "bg-primary/20 text-primary", icon: Activity },
  pending: { color: "bg-amber-500/20 text-amber-400", icon: Clock },
  paused: { color: "bg-amber-500/20 text-amber-400", icon: Pause },
  completed: { color: "bg-primary/20 text-primary", icon: CheckCircle },
  error: { color: "bg-destructive/20 text-destructive", icon: XCircle },
  shutdown: { color: "bg-muted text-muted-foreground", icon: XCircle },
  draft: { color: "bg-muted text-muted-foreground", icon: Clock },
  active: { color: "bg-primary/20 text-primary", icon: Zap },
};

export default function ManagedAgents() {
  const { user, role } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [agentsData, sessionsData] = await Promise.all([
        callManagedAgent({ action: "list_agents", user_id: user.id }),
        callManagedAgent({ action: "list_sessions", user_id: user.id }),
      ]);
      setAgents(agentsData || []);
      setSessions(sessionsData || []);
    } catch (e: any) {
      console.error("Load error:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Realtime subscription for session updates
  useEffect(() => {
    if (!user?.id) return;

    const ch = supabase
      .channel("managed-sessions-rt")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "managed_sessions",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setSessions(prev => prev.map(s => s.id === (payload.new as any).id ? { ...s, ...payload.new } : s));
        } else if (payload.eventType === "INSERT") {
          setSessions(prev => [payload.new as any, ...prev]);
        }
      })
      .subscribe();

    const ch2 = supabase
      .channel("managed-events-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "managed_events" }, (payload) => {
        const ev = payload.new as any;
        if (selectedSession && ev.session_id === selectedSession) {
          setEvents(prev => [...prev, ev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); supabase.removeChannel(ch2); };
  }, [selectedSession, user?.id]);

  const loadEvents = async (sessionId: string) => {
    setSelectedSession(sessionId);
    try {
      const data = await callManagedAgent({ action: "get_events", session_id: sessionId });
      setEvents(data || []);
    } catch { setEvents([]); }
  };

  const handleControl = async (sessionId: string, control: string) => {
    try {
      await callManagedAgent({ action: "control_session", session_id: sessionId, control });
      toast.success(`Session ${control}ed`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleApproval = async (eventId: string, approved: boolean) => {
    try {
      await callManagedAgent({ action: "approve_event", event_id: eventId, approved });
      toast.success(approved ? "Approved" : "Rejected");
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, approval_status: approved ? "approved" : "rejected" } : e));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Cost summary
  const totalCost = sessions.reduce((sum, s) => sum + (s.cost_data?.total_cost || 0), 0);
  const activeSessions = sessions.filter(s => s.status === "running").length;
  const pendingApprovals = events.filter(e => e.requires_approval && e.approval_status === "pending").length;

  const statCards = [
    { label: "Active Agents", value: agents.filter(a => a.status === "active").length, icon: Bot, color: "text-primary" },
    { label: "Live Sessions", value: activeSessions, icon: Activity, color: "text-[hsl(200,100%,60%)]" },
    { label: "Pending Approvals", value: pendingApprovals, icon: Shield, color: "text-amber-400" },
    { label: "Total Cost", value: `$${totalCost.toFixed(2)}`, icon: DollarSign, color: "text-[hsl(45,100%,60%)]" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Bot className="text-primary" /> My Managed Agents
          </h1>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={`mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="glass-card">
                <CardContent className="p-4">
                  <s.icon size={18} className={`${s.color} mb-2`} />
                  <div className="text-xl font-display font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="sessions">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="events">Event Stream</TabsTrigger>
            <TabsTrigger value="approvals">Approval Queue</TabsTrigger>
            <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  <AnimatePresence>
                    {sessions.map((s) => {
                      const cfg = statusConfig[s.status] || statusConfig.pending;
                      return (
                        <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{s.managed_agents?.name || "Agent"}</div>
                            <div className="text-xs text-muted-foreground mt-1 flex gap-2 flex-wrap">
                              <Badge className={cfg.color} variant="secondary">{s.status}</Badge>
                              <span>{s.approval_mode === "approval" ? "🔒 Approval" : "⚡ Auto"}</span>
                              {s.cost_data?.total_cost > 0 && <span>${s.cost_data.total_cost.toFixed(2)}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => loadEvents(s.id)}>
                              <Eye size={14} />
                            </Button>
                            {s.status === "running" && (
                              <>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-400" onClick={() => handleControl(s.id, "pause")}>
                                  <Pause size={14} />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleControl(s.id, "shutdown")}>
                                  <XCircle size={14} />
                                </Button>
                              </>
                            )}
                            {s.status === "paused" && (
                              <Button size="sm" variant="ghost" className="h-7 text-primary" onClick={() => handleControl(s.id, "resume")}>
                                <Play size={14} className="mr-1" /> Resume
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {sessions.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No managed agent sessions yet. Sessions are created when a workflow deploys as a Claude Managed Agent.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {agents.map((a) => {
                    const cfg = statusConfig[a.status] || statusConfig.draft;
                    return (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{a.name}</div>
                          <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                            <Badge className={cfg.color} variant="secondary">{a.status}</Badge>
                            <span className="font-mono">{a.model}</span>
                            <span>v{a.version}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {agents.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No managed agents created yet.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm font-display">
                  {selectedSession ? "Live Event Stream" : "Select a session to view events"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto font-mono text-xs">
                  <AnimatePresence>
                    {events.map((ev) => (
                      <motion.div key={ev.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className={`p-2 rounded border ${ev.requires_approval ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-secondary/30"}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-semibold">{ev.event_type}</span>
                          <span className="text-muted-foreground">{new Date(ev.created_at).toLocaleTimeString()}</span>
                        </div>
                        {ev.event_data?.content && (
                          <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{typeof ev.event_data.content === "string" ? ev.event_data.content.slice(0, 200) : JSON.stringify(ev.event_data.content).slice(0, 200)}</p>
                        )}
                        {ev.requires_approval && ev.approval_status === "pending" && (
                          <div className="mt-2 flex gap-2">
                            <Button size="sm" variant="default" className="h-6 text-xs" onClick={() => handleApproval(ev.id, true)}>
                              <CheckCircle size={12} className="mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="h-6 text-xs" onClick={() => handleApproval(ev.id, false)}>
                              <XCircle size={12} className="mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {events.length === 0 && <p className="text-muted-foreground text-center py-8 font-sans text-sm">No events yet.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals">
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {events.filter(e => e.requires_approval).map((ev) => (
                    <div key={ev.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-sm">{ev.event_type}</span>
                          <Badge className={ev.approval_status === "pending" ? "bg-amber-500/20 text-amber-400 ml-2" : ev.approval_status === "approved" ? "bg-primary/20 text-primary ml-2" : "bg-destructive/20 text-destructive ml-2"} variant="secondary">
                            {ev.approval_status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(ev.created_at).toLocaleString()}</span>
                      </div>
                      {ev.event_data?.description && (
                        <p className="text-xs text-muted-foreground mt-2">{ev.event_data.description}</p>
                      )}
                      {ev.approval_status === "pending" && (
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" onClick={() => handleApproval(ev.id, true)}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleApproval(ev.id, false)}>Reject</Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {events.filter(e => e.requires_approval).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No approval requests.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs">
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border text-center">
                      <div className="text-2xl font-display font-bold">${totalCost.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Total Spend</div>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border text-center">
                      <div className="text-2xl font-display font-bold">
                        {sessions.reduce((sum, s) => sum + (s.cost_data?.session_hours || 0), 0).toFixed(1)}h
                      </div>
                      <div className="text-xs text-muted-foreground">Session Hours</div>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border text-center">
                      <div className="text-2xl font-display font-bold">{sessions.length}</div>
                      <div className="text-xs text-muted-foreground">Total Sessions</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-display font-bold">Per-Session Breakdown</h3>
                    {sessions.filter(s => s.cost_data?.total_cost > 0).map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-2 rounded bg-secondary/30 text-sm">
                        <span>{s.managed_agents?.name || "Agent"}</span>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{s.cost_data.session_hours.toFixed(1)}h @ $0.08</span>
                          <span>Tokens: ${s.cost_data.token_cost.toFixed(2)}</span>
                          <span className="font-bold text-foreground">${s.cost_data.total_cost.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                    {sessions.filter(s => s.cost_data?.total_cost > 0).length === 0 && (
                      <p className="text-sm text-muted-foreground">No costs recorded yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
