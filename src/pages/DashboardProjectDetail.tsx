import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Calendar, User, MessageSquare, DollarSign, CheckCircle2, Clock } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  is_admin: boolean;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  paid_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  planning: "bg-blue-500/20 text-blue-400",
  "in-progress": "bg-amber-500/20 text-amber-400",
  review: "bg-purple-500/20 text-purple-400",
  completed: "bg-primary/20 text-primary",
};

export default function DashboardProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin";

  const [project, setProject] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Milestone form
  const [mForm, setMForm] = useState({ title: "", description: "", due_date: "" });

  const loadProject = async () => {
    if (!id) return;
    const { data } = await supabase.from("projects").select("*, clients(name, email, company)").eq("id", id).single();
    setProject(data);
  };

  const loadComments = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("project_comments")
      .select("*, profiles:user_id(full_name)")
      .eq("project_id", id)
      .order("created_at", { ascending: true });
    setComments((data as any[]) ?? []);
  };

  const loadMilestones = async () => {
    if (!id) return;
    const { data } = await supabase.from("milestones").select("*").eq("project_id", id).order("due_date", { ascending: true });
    setMilestones(data ?? []);
  };

  const loadPayments = async () => {
    if (!id || !isAdmin) return;
    const { data } = await supabase.from("payments").select("*").eq("project_id", id).order("created_at", { ascending: false });
    setPayments((data as Payment[]) ?? []);
  };

  useEffect(() => {
    loadProject();
    loadComments();
    loadMilestones();
    loadPayments();
  }, [id]);

  // Realtime comments
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`comments-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "project_comments", filter: `project_id=eq.${id}` }, () => {
        loadComments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !id) return;
    setSending(true);
    const { error } = await supabase.from("project_comments").insert({
      project_id: id,
      user_id: user.id,
      content: newComment.trim(),
      is_admin: isAdmin,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewComment("");
    }
    setSending(false);
  };

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    await supabase.from("projects").update({ status }).eq("id", id);
    loadProject();
    toast({ title: `Project status updated to ${status}` });
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const { error } = await supabase.from("milestones").insert({
      project_id: id,
      title: mForm.title,
      description: mForm.description || null,
      due_date: mForm.due_date || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMForm({ title: "", description: "", due_date: "" });
      loadMilestones();
      toast({ title: "Milestone added" });
    }
  };

  const handleMilestoneStatus = async (mId: string, status: string) => {
    await supabase.from("milestones").update({ status }).eq("id", mId);
    loadMilestones();
  };

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-3 text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold">{project.title}</h1>
            {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
            {project.clients && (
              <p className="text-sm text-muted-foreground mt-1">
                <User className="h-3 w-3 inline mr-1" />
                {project.clients.name} {project.clients.company && `· ${project.clients.company}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Select value={project.status} onValueChange={handleStatusChange}>
                <SelectTrigger className={`w-[140px] border-0 text-sm font-medium ${statusColors[project.status] ?? ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge className={statusColors[project.status] ?? ""}>{project.status}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column - Comments */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Discussion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto space-y-3 mb-4 pr-2">
                {comments.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    No messages yet. Start the conversation!
                  </p>
                )}
                {comments.map((c) => {
                  const isMine = c.user_id === user?.id;
                  return (
                    <div key={c.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        isMine
                          ? "bg-primary/20 text-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">
                            {(c as any).profiles?.full_name ?? (c.is_admin ? "Admin" : "Client")}
                          </span>
                          {c.is_admin && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary/30 text-primary">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{c.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(c.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={commentsEndRef} />
              </div>

              <form onSubmit={handleSendComment} className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-secondary border-border flex-1"
                />
                <Button type="submit" disabled={sending || !newComment.trim()} className="bg-primary text-primary-foreground">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Side column - Milestones & Payments */}
        <div className="space-y-6">
          {/* Milestones */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {milestones.length === 0 && <p className="text-sm text-muted-foreground">No milestones yet.</p>}
              {milestones.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {m.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={`text-sm truncate ${m.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                        {m.title}
                      </span>
                    </div>
                    {m.due_date && (
                      <span className="text-[10px] text-muted-foreground ml-6 flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {new Date(m.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <Select value={m.status} onValueChange={(v) => handleMilestoneStatus(m.id, v)}>
                      <SelectTrigger className="w-[100px] border-0 text-xs h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}

              {/* Add milestone form (admin only) */}
              {isAdmin && (
                <form onSubmit={handleAddMilestone} className="pt-3 border-t border-border space-y-2">
                  <Input
                    placeholder="Milestone title"
                    value={mForm.title}
                    onChange={(e) => setMForm({ ...mForm, title: e.target.value })}
                    className="bg-secondary border-border text-sm"
                    required
                  />
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={mForm.due_date}
                      onChange={(e) => setMForm({ ...mForm, due_date: e.target.value })}
                      className="bg-secondary border-border text-sm flex-1"
                    />
                    <Button type="submit" size="sm" className="bg-primary text-primary-foreground">Add</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Payments (admin only) */}
          {isAdmin && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {payments.length === 0 && <p className="text-sm text-muted-foreground">No payments recorded.</p>}
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="text-sm font-medium">${p.amount.toFixed(2)} {p.currency}</p>
                      {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                    </div>
                    <Badge className={p.status === "paid" ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-400"}>
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
