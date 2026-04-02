import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderKanban, Milestone, TrendingUp, Inbox, DollarSign, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    clients: 0, projects: 0, milestones: 0, completed: 0,
    inquiries: 0, newInquiries: 0, submissions: 0, revenue: 0,
  });

  useEffect(() => {
    async function load() {
      const [c, p, m, done, inq, newInq, subs, payments] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("milestones").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("project_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("payments").select("amount").eq("status", "paid"),
      ]);
      const totalRevenue = (payments.data ?? []).reduce((sum, p) => sum + Number((p as any).amount), 0);
      setStats({
        clients: c.count ?? 0,
        projects: p.count ?? 0,
        milestones: m.count ?? 0,
        completed: done.count ?? 0,
        inquiries: inq.count ?? 0,
        newInquiries: newInq.count ?? 0,
        submissions: subs.count ?? 0,
        revenue: totalRevenue,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-primary", link: "/dashboard/payments" },
    { label: "New Inquiries", value: stats.newInquiries, icon: Inbox, color: "text-blue-400", link: "/dashboard/inquiries" },
    { label: "Pending Submissions", value: stats.submissions, icon: FileText, color: "text-purple-400", link: "/dashboard/submissions" },
    { label: "Active Projects", value: stats.projects, icon: FolderKanban, color: "text-amber-400", link: "/dashboard/projects" },
    { label: "Clients", value: stats.clients, icon: Users, color: "text-primary", link: "/dashboard/clients" },
    { label: "Milestones", value: stats.milestones, icon: Milestone, color: "text-amber-400", link: "/dashboard/milestones" },
    { label: "Completed", value: stats.completed, icon: TrendingUp, color: "text-primary", link: "/dashboard/projects" },
    { label: "Total Inquiries", value: stats.inquiries, icon: Inbox, color: "text-muted-foreground", link: "/dashboard/inquiries" },
  ];

  return (
    <DashboardLayout requireRole="admin">
      <h1 className="text-2xl font-display font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card
            key={c.label}
            className="glass-card cursor-pointer hover:border-primary/20 transition-colors"
            onClick={() => navigate(c.link)}
          >
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
