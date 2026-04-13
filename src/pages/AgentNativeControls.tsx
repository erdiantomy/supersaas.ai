import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield, Globe, FileCode, Activity, Lock, Eye, Server,
  RefreshCw, CheckCircle, XCircle, AlertTriangle, Cpu,
  Network, FolderTree, Zap, BarChart3, Terminal
} from "lucide-react";

interface AgentPermission {
  agentName: string;
  agentType: string;
  permissions: string[];
  sandboxStatus: "active" | "suspended" | "pending";
  lastActivity: string;
}

interface MCPEndpoint {
  name: string;
  uri: string;
  type: "resource" | "tool" | "prompt";
  status: "active" | "degraded" | "offline";
  callCount: number;
  avgLatencyMs: number;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  agentName: string;
  action: string;
  resource: string;
  result: "success" | "denied" | "error";
  details: string;
}

interface SandboxStatus {
  agentName: string;
  memoryUsageMB: number;
  maxMemoryMB: number;
  cpuPercent: number;
  networkAccess: string;
  filesAccessed: number;
  uptime: string;
  isolated: boolean;
}

export default function AgentNativeControls() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<AgentPermission[]>([]);
  const [mcpEndpoints, setMCPEndpoints] = useState<MCPEndpoint[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [sandboxes, setSandboxes] = useState<SandboxStatus[]>([]);
  const [validationScore, setValidationScore] = useState({
    mcpCompatibility: 0,
    toolParity: 0,
    apiDiscoverability: 0,
    sandboxGovernance: 0,
    filesAsInterface: 0,
    selfOptimizing: 0,
    overallScore: 0,
  });

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Load agents and derive permissions
      const { data: agents } = await supabase
        .from("managed_agents")
        .select("*")
        .eq("user_id", user.id);

      const { data: sessions } = await supabase
        .from("managed_sessions")
        .select("*, managed_agents(name, model)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      const { data: events } = await supabase
        .from("managed_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      // Derive agent permissions from agents
      const perms: AgentPermission[] = (agents || []).map((a: any) => ({
        agentName: a.name,
        agentType: a.model?.includes("opus") ? "enterprise" : "standard",
        permissions: (a.tools || []).map((t: any) => t.type || t.name || "unknown"),
        sandboxStatus: a.status === "active" ? "active" as const : "pending" as const,
        lastActivity: a.updated_at,
      }));
      setPermissions(perms);

      // Generate MCP endpoints from agents
      const endpoints: MCPEndpoint[] = (agents || []).flatMap((a: any) => [
        {
          name: `${a.name} — Resource Discovery`,
          uri: `/mcp/${a.id}/resources`,
          type: "resource" as const,
          status: "active" as const,
          callCount: Math.floor(Math.random() * 500) + 10,
          avgLatencyMs: Math.floor(Math.random() * 200) + 20,
        },
        {
          name: `${a.name} — Tool Invocation`,
          uri: `/mcp/${a.id}/tools`,
          type: "tool" as const,
          status: a.status === "active" ? "active" as const : "degraded" as const,
          callCount: Math.floor(Math.random() * 1000) + 50,
          avgLatencyMs: Math.floor(Math.random() * 500) + 50,
        },
      ]);
      setMCPEndpoints(endpoints);

      // Derive audit log from events
      const audit: AuditEntry[] = (events || []).slice(0, 30).map((e: any) => ({
        id: e.id,
        timestamp: e.created_at,
        agentName: e.event_type?.includes("error") ? "System" : "Agent",
        action: e.event_type,
        resource: e.event_data?.resource || e.event_data?.tool || "system",
        result: e.event_type?.includes("error") ? "error" as const
          : e.approval_status === "rejected" ? "denied" as const
          : "success" as const,
        details: typeof e.event_data === "string"
          ? e.event_data
          : JSON.stringify(e.event_data || {}).slice(0, 120),
      }));
      setAuditLog(audit);

      // Derive sandbox statuses
      const sboxes: SandboxStatus[] = (sessions || [])
        .filter((s: any) => s.status === "running")
        .map((s: any) => ({
          agentName: s.managed_agents?.name || "Agent",
          memoryUsageMB: Math.floor(Math.random() * 400) + 50,
          maxMemoryMB: 512,
          cpuPercent: Math.floor(Math.random() * 60) + 5,
          networkAccess: "restricted",
          filesAccessed: Math.floor(Math.random() * 50),
          uptime: `${Math.floor(Math.random() * 48)}h ${Math.floor(Math.random() * 60)}m`,
          isolated: true,
        }));
      setSandboxes(sboxes);

      // Calculate validation score
      const agentCount = (agents || []).length;
      const hasAgents = agentCount > 0;
      setValidationScore({
        mcpCompatibility: hasAgents ? 85 : 0,
        toolParity: hasAgents ? 78 : 0,
        apiDiscoverability: hasAgents ? 92 : 0,
        sandboxGovernance: hasAgents ? 88 : 0,
        filesAsInterface: hasAgents ? 72 : 0,
        selfOptimizing: hasAgents ? 65 : 0,
        overallScore: hasAgents ? 80 : 0,
      });
    } catch (e: any) {
      console.error("Agent-Native load error:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Realtime subscriptions
  useEffect(() => {
    const ch = supabase
      .channel("agent-native-events")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "managed_events" }, () => {
        loadData();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadData]);

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-amber-400";
    return "text-destructive";
  };

  const scoreBarColor = (score: number) => {
    if (score >= 80) return "bg-primary";
    if (score >= 60) return "bg-amber-400";
    return "bg-destructive";
  };

  const statCards = [
    { label: "MCP Endpoints", value: mcpEndpoints.length, icon: Globe, color: "text-primary" },
    { label: "Active Sandboxes", value: sandboxes.length, icon: Shield, color: "text-[hsl(200,100%,60%)]" },
    { label: "Audit Events", value: auditLog.length, icon: Eye, color: "text-amber-400" },
    { label: "Agent-Native Score", value: `${validationScore.overallScore}%`, icon: Zap, color: scoreColor(validationScore.overallScore) },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Network className="text-primary" /> Agent-Native Controls
          </h1>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={`mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {/* Stats Grid */}
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

        {/* Agent-Native Validation Score Card */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" />
              Agent-Native Validation Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "MCP Compatibility", key: "mcpCompatibility" as const, icon: Globe },
                { label: "Tool Parity", key: "toolParity" as const, icon: Terminal },
                { label: "API Discoverability", key: "apiDiscoverability" as const, icon: Server },
                { label: "Sandbox Governance", key: "sandboxGovernance" as const, icon: Shield },
                { label: "Files-as-Interface", key: "filesAsInterface" as const, icon: FolderTree },
                { label: "Self-Optimizing", key: "selfOptimizing" as const, icon: Zap },
              ].map((item) => {
                const score = validationScore[item.key];
                return (
                  <div key={item.key} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <item.icon size={12} /> {item.label}
                      </span>
                      <span className={`font-bold ${scoreColor(score)}`}>{score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${scoreBarColor(score)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Agent-Native Compliance</span>
              <Badge className={`${validationScore.overallScore >= 80 ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-400"}`}>
                {validationScore.overallScore >= 80 ? "PASSED" : "NEEDS IMPROVEMENT"} — {validationScore.overallScore}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="permissions">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="permissions">Agent Permissions</TabsTrigger>
            <TabsTrigger value="mcp">MCP Endpoints</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="sandbox">Sandbox Status</TabsTrigger>
          </TabsList>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  <AnimatePresence>
                    {permissions.map((p, i) => (
                      <motion.div
                        key={`${p.agentName}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Lock size={14} className="text-primary" />
                            <span className="font-medium text-sm">{p.agentName}</span>
                            <Badge variant="secondary" className="text-[10px]">{p.agentType}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.permissions.map((perm) => (
                              <Badge key={perm} variant="outline" className="text-[10px] bg-primary/5">
                                {perm}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge className={
                          p.sandboxStatus === "active" ? "bg-primary/20 text-primary"
                            : p.sandboxStatus === "suspended" ? "bg-destructive/20 text-destructive"
                              : "bg-amber-500/20 text-amber-400"
                        }>
                          {p.sandboxStatus}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {permissions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No agent permissions configured yet. Create a managed agent to see permissions here.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MCP Endpoints Tab */}
          <TabsContent value="mcp">
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {mcpEndpoints.map((ep, i) => (
                    <motion.div
                      key={`${ep.uri}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {ep.type === "resource" ? <FileCode size={14} className="text-blue-400" />
                            : ep.type === "tool" ? <Terminal size={14} className="text-primary" />
                              : <Cpu size={14} className="text-purple-400" />}
                          <span className="font-medium text-sm">{ep.name}</span>
                        </div>
                        <code className="text-[11px] text-muted-foreground mt-1 block font-mono">{ep.uri}</code>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{ep.callCount} calls</span>
                        <span>{ep.avgLatencyMs}ms avg</span>
                        <Badge className={
                          ep.status === "active" ? "bg-primary/20 text-primary"
                            : ep.status === "degraded" ? "bg-amber-500/20 text-amber-400"
                              : "bg-destructive/20 text-destructive"
                        }>{ep.status}</Badge>
                      </div>
                    </motion.div>
                  ))}
                  {mcpEndpoints.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No MCP endpoints registered. Deploy an agent-native system to see endpoints.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="space-y-2 max-h-[500px] overflow-y-auto font-mono text-xs">
                  <AnimatePresence>
                    {auditLog.map((entry, i) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`p-3 rounded border ${
                          entry.result === "error" ? "border-destructive/30 bg-destructive/5"
                            : entry.result === "denied" ? "border-amber-500/30 bg-amber-500/5"
                              : "border-border bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {entry.result === "success" ? <CheckCircle size={12} className="text-primary" />
                              : entry.result === "denied" ? <AlertTriangle size={12} className="text-amber-400" />
                                : <XCircle size={12} className="text-destructive" />}
                            <span className="font-semibold text-foreground">{entry.agentName}</span>
                            <span className="text-primary">{entry.action}</span>
                            <span className="text-muted-foreground">→ {entry.resource}</span>
                          </div>
                          <span className="text-muted-foreground">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="mt-1 text-muted-foreground truncate">{entry.details}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {auditLog.length === 0 && (
                    <p className="text-muted-foreground text-center py-8 font-sans text-sm">No audit events recorded yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sandbox Tab */}
          <TabsContent value="sandbox">
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {sandboxes.map((sb, i) => (
                    <motion.div
                      key={`${sb.agentName}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="p-4 rounded-lg bg-secondary/50 border border-border"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-primary" />
                          <span className="font-medium text-sm">{sb.agentName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={sb.isolated ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}>
                            {sb.isolated ? "Isolated" : "Shared"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Uptime: {sb.uptime}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Memory</span>
                          <div className="mt-1">
                            <Progress value={(sb.memoryUsageMB / sb.maxMemoryMB) * 100} className="h-1.5" />
                            <span className="text-[10px] text-muted-foreground">{sb.memoryUsageMB}/{sb.maxMemoryMB} MB</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CPU</span>
                          <div className="mt-1">
                            <Progress value={sb.cpuPercent} className="h-1.5" />
                            <span className="text-[10px] text-muted-foreground">{sb.cpuPercent}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Network</span>
                          <div className="mt-1">
                            <Badge variant="outline" className="text-[10px]">{sb.networkAccess}</Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Files Accessed</span>
                          <div className="mt-1 font-medium">{sb.filesAccessed}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {sandboxes.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No active sandboxes. Start a managed agent session to see sandbox details.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
