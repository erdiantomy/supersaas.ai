import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Plus, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

interface Payment {
  id: string;
  project_id: string | null;
  client_id: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  revenuecat_id: string | null;
  paid_at: string | null;
  created_at: string;
  projects?: { title: string } | null;
  clients?: { name: string } | null;
}

export default function DashboardPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    project_id: "",
    client_id: "",
    amount: "",
    currency: "USD",
    status: "pending",
    description: "",
    revenuecat_id: "",
  });
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase
      .from("payments")
      .select("*, projects(title), clients(name)")
      .order("created_at", { ascending: false });
    setPayments((data as Payment[]) ?? []);

    const { data: pj } = await supabase.from("projects").select("id, title");
    setProjects(pj ?? []);
    const { data: cl } = await supabase.from("clients").select("id, name");
    setClients(cl ?? []);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("payments").insert({
      project_id: form.project_id || null,
      client_id: form.client_id || null,
      amount: parseFloat(form.amount),
      currency: form.currency,
      status: form.status,
      description: form.description || null,
      revenuecat_id: form.revenuecat_id || null,
      paid_at: form.status === "paid" ? new Date().toISOString() : null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Payment recorded" });
    setForm({ project_id: "", client_id: "", amount: "", currency: "USD", status: "pending", description: "", revenuecat_id: "" });
    setOpen(false);
    load();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const update: any = { status };
    if (status === "paid") update.paid_at = new Date().toISOString();
    await supabase.from("payments").update(update).eq("id", id);
    load();
  };

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingAmount = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <DashboardLayout requireRole="admin">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold">Payments</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:brightness-110">
              <Plus className="mr-2 h-4 w-4" /> Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Amount *"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  className="bg-secondary border-border"
                />
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="IDR">IDR</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-secondary border-border"
              />
              <Input
                placeholder="RevenueCat ID (optional)"
                value={form.revenuecat_id}
                onChange={(e) => setForm({ ...form, revenuecat_id: e.target.value })}
                className="bg-secondary border-border"
              />
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full bg-primary text-primary-foreground">Save Payment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="glass-card">
          <CardContent className="py-4 px-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-4 px-6 flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-bold">${pendingAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-4 px-6 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Paid Invoices</p>
              <p className="text-xl font-bold">{payments.filter((p) => p.status === "paid").length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments list */}
      <div className="grid gap-3">
        {payments.length === 0 && <p className="text-muted-foreground text-center py-8">No payments recorded yet.</p>}
        {payments.map((p) => (
          <Card key={p.id} className="glass-card">
            <CardContent className="py-4 px-6 flex items-center justify-between">
              <div>
                <p className="font-semibold">${Number(p.amount).toFixed(2)} {p.currency}</p>
                <p className="text-sm text-muted-foreground">
                  {p.clients?.name ?? "No client"} · {p.projects?.title ?? "No project"}
                  {p.description && ` · ${p.description}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(p.created_at).toLocaleDateString()}
                  {p.revenuecat_id && ` · RC: ${p.revenuecat_id}`}
                </p>
              </div>
              <Select value={p.status} onValueChange={(v) => handleStatusChange(p.id, v)}>
                <SelectTrigger className={`w-[110px] border-0 text-xs font-medium ${
                  p.status === "paid" ? "bg-primary/20 text-primary" :
                  p.status === "overdue" ? "bg-destructive/20 text-destructive" :
                  p.status === "refunded" ? "bg-muted text-muted-foreground" :
                  "bg-amber-500/20 text-amber-400"
                }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
