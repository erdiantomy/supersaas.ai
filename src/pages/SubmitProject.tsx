import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, CheckCircle2 } from "lucide-react";

export default function SubmitProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    project_name: "",
    project_type: "",
    description: "",
    budget_range: "",
    timeline: "",
    features: "",
    tech_requirements: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const { error } = await supabase.from("project_submissions").insert({
      user_id: user.id,
      ...form,
    } as any);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-16">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-display font-bold mb-3">Project Submitted!</h2>
          <p className="text-muted-foreground mb-8">
            Our team will review your requirements and get back to you within 24 hours
            with a tailored architecture plan and fixed-price quote.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/portal")} className="bg-primary text-primary-foreground">
              Back to Portal
            </Button>
            <Button
              variant="outline"
              onClick={() => { setSubmitted(false); setForm({ project_name: "", project_type: "", description: "", budget_range: "", timeline: "", features: "", tech_requirements: "" }); }}
            >
              Submit Another
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-display font-bold mb-2">Submit Your Project</h1>
        <p className="text-muted-foreground mb-8">
          Tell us about your project and we'll create a tailored plan just for you.
        </p>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Project Name *</label>
                <Input
                  placeholder="e.g. Multi-Branch Inventory System"
                  value={form.project_name}
                  onChange={(e) => setForm({ ...form, project_name: e.target.value })}
                  required
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Project Type *</label>
                <Select value={form.project_type} onValueChange={(v) => setForm({ ...form, project_type: v })}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Custom ERP">Custom ERP</SelectItem>
                    <SelectItem value="POS System">POS System</SelectItem>
                    <SelectItem value="SaaS Product">SaaS Product</SelectItem>
                    <SelectItem value="API & Integration">API & Integration</SelectItem>
                    <SelectItem value="Web Application">Web Application</SelectItem>
                    <SelectItem value="Mobile Application">Mobile Application</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Description *</label>
                <Textarea
                  placeholder="Describe your project in detail — what problem does it solve? Who are the users? What are the key workflows?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  className="bg-secondary border-border min-h-[120px]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Budget Range</label>
                  <Select value={form.budget_range} onValueChange={(v) => setForm({ ...form, budget_range: v })}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$5k - $15k">$5k - $15k</SelectItem>
                      <SelectItem value="$15k - $30k">$15k - $30k</SelectItem>
                      <SelectItem value="$30k - $50k">$30k - $50k</SelectItem>
                      <SelectItem value="$50k - $100k">$50k - $100k</SelectItem>
                      <SelectItem value="$100k+">$100k+</SelectItem>
                      <SelectItem value="Not sure yet">Not sure yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Timeline</label>
                  <Select value={form.timeline} onValueChange={(v) => setForm({ ...form, timeline: v })}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Expected timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                      <SelectItem value="1-2 months">1-2 months</SelectItem>
                      <SelectItem value="2-3 months">2-3 months</SelectItem>
                      <SelectItem value="3-6 months">3-6 months</SelectItem>
                      <SelectItem value="6+ months">6+ months</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Key Features</label>
                <Textarea
                  placeholder="List the main features you need, one per line:&#10;- Multi-branch inventory&#10;- Role-based access control&#10;- Real-time dashboards"
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className="bg-secondary border-border min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Technical Requirements</label>
                <Textarea
                  placeholder="Any specific tech requirements? (e.g. offline support, integrations with existing systems, specific APIs)"
                  value={form.tech_requirements}
                  onChange={(e) => setForm({ ...form, tech_requirements: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting || !form.project_name || !form.project_type || !form.description}
                className="w-full bg-primary text-primary-foreground hover:brightness-110"
              >
                {submitting ? "Submitting..." : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Submit Project
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
