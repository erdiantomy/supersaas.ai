import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, Building2, MessageSquare, Clock, Search, Eye } from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  new: { label: "New", class: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  contacted: { label: "Contacted", class: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  qualified: { label: "Qualified", class: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  converted: { label: "Converted", class: "bg-primary/20 text-primary border-primary/30" },
  closed: { label: "Closed", class: "bg-muted text-muted-foreground border-border" },
};

export default function DashboardInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    setInquiries((data as Inquiry[]) ?? []);
  };

  useEffect(() => { load(); }, []);

  const filtered = inquiries.filter((i) => {
    const matchSearch = !search || 
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase()) ||
      (i.company?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === "all" || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    load();
    toast({ title: `Status updated to ${status}` });
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    await supabase.from("inquiries").update({ notes: adminNotes }).eq("id", selected.id);
    toast({ title: "Notes saved" });
    setSelected(null);
    load();
  };

  const newCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <DashboardLayout requireRole="admin">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Inquiries</h1>
          {newCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-primary font-semibold">{newCount}</span> new inquiries waiting
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="grid gap-3">
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No inquiries found.</p>
        )}
        {filtered.map((inq) => (
          <Card key={inq.id} className="glass-card hover:border-primary/20 transition-colors">
            <CardContent className="py-4 px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold truncate">{inq.name}</p>
                    {inq.status === "new" && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{inq.email}</span>
                    {inq.company && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{inq.company}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(inq.created_at).toLocaleDateString()}</span>
                  </div>
                  {inq.message && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      <MessageSquare className="h-3 w-3 inline mr-1" />
                      {inq.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={inq.status} onValueChange={(v) => handleStatusChange(inq.id, v)}>
                    <SelectTrigger className={`w-[120px] border text-xs font-medium ${statusConfig[inq.status]?.class ?? ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setSelected(inq); setAdminNotes(inq.notes ?? ""); }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Inquiry from {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selected.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Company</p>
                  <p className="font-medium">{selected.company || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={statusConfig[selected.status]?.class}>{statusConfig[selected.status]?.label}</Badge>
                </div>
              </div>

              {selected.message && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Message</p>
                  <div className="bg-secondary/50 rounded-lg p-3 text-sm">{selected.message}</div>
                </div>
              )}

              <div>
                <p className="text-muted-foreground text-sm mb-1">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this inquiry..."
                  className="bg-secondary border-border"
                  rows={3}
                />
              </div>

              <Button onClick={handleSaveNotes} className="w-full bg-primary text-primary-foreground">
                Save Notes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
