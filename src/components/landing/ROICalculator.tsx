import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, DollarSign, Users, TrendingUp, Clock, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const TEAM_LABELS = [
  { max: 5, label: "Startup", agencyWeeks: 24, agencyCost: 80000 },
  { max: 15, label: "Growing", agencyWeeks: 32, agencyCost: 150000 },
  { max: 30, label: "Mid-Market", agencyWeeks: 40, agencyCost: 280000 },
  { max: 50, label: "Scale-Up", agencyWeeks: 48, agencyCost: 420000 },
  { max: Infinity, label: "Enterprise", agencyWeeks: 60, agencyCost: 650000 },
];

function getTeamTier(size: number) {
  return TEAM_LABELS.find((t) => size <= t.max) || TEAM_LABELS[TEAM_LABELS.length - 1];
}

export function ROICalculator() {
  const [monthlySpend, setMonthlySpend] = useState([8000]);
  const [teamSize, setTeamSize] = useState([12]);

  const results = useMemo(() => {
    const spend = monthlySpend[0];
    const team = teamSize[0];
    const tier = getTeamTier(team);

    // SuperSaaS pricing model
    const superSaasOneTime = Math.max(12000, spend * 1.5);
    const superSaasMonthly = Math.round(spend * 0.15); // 85% cheaper ongoing
    const superSaasWeeks = Math.max(2, Math.round(tier.agencyWeeks / 6));

    // Annual comparisons
    const currentAnnual = spend * 12;
    const agencyAnnual = tier.agencyCost + spend * 6; // agency + reduced SaaS after
    const superSaasAnnual = superSaasOneTime + superSaasMonthly * 12;

    const savingsVsCurrent = currentAnnual - superSaasAnnual;
    const savingsVsAgency = agencyAnnual - superSaasAnnual;
    const savingsPercent = Math.round((savingsVsCurrent / currentAnnual) * 100);
    const timeSavedWeeks = tier.agencyWeeks - superSaasWeeks;
    const paybackMonths = Math.round(superSaasOneTime / (spend - superSaasMonthly));

    return {
      spend,
      team,
      tier,
      superSaasOneTime,
      superSaasMonthly,
      superSaasWeeks,
      currentAnnual,
      agencyAnnual,
      superSaasAnnual,
      savingsVsCurrent: Math.max(0, savingsVsCurrent),
      savingsVsAgency: Math.max(0, savingsVsAgency),
      savingsPercent: Math.max(0, Math.min(savingsPercent, 95)),
      timeSavedWeeks,
      paybackMonths: Math.max(1, paybackMonths),
    };
  }, [monthlySpend, teamSize]);

  return (
    <section id="roi" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Calculator size={12} className="mr-1" /> ROI Calculator
          </Badge>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            See How Much You'll <span className="text-primary">Save</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Input your current software spend and team size. Our AI agents deliver custom solutions at a fraction of the cost.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Card className="glass-card">
              <CardContent className="p-6 space-y-8">
                {/* Monthly SaaS Spend */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <DollarSign size={16} className="text-primary" />
                      Monthly Software Spend
                    </label>
                    <span className="text-2xl font-display font-bold text-primary">
                      ${results.spend.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={monthlySpend}
                    onValueChange={setMonthlySpend}
                    min={2000}
                    max={50000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>$2K</span>
                    <span>$50K</span>
                  </div>
                </div>

                {/* Team Size */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Users size={16} className="text-primary" />
                      Team Size
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-display font-bold text-primary">
                        {results.team}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {results.tier.label}
                      </Badge>
                    </div>
                  </div>
                  <Slider
                    value={teamSize}
                    onValueChange={setTeamSize}
                    min={2}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>2 people</span>
                    <span>100 people</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparison bar chart */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h4 className="text-sm font-medium mb-4 text-muted-foreground">Annual Cost Comparison</h4>
                <div className="space-y-4">
                  {[
                    { label: "Current SaaS Stack", value: results.currentAnnual, color: "bg-destructive/60" },
                    { label: "Traditional Agency", value: results.agencyAnnual, color: "bg-muted-foreground/40" },
                    { label: "SuperSaaS.ai", value: results.superSaasAnnual, color: "bg-primary" },
                  ].map((item) => {
                    const maxVal = Math.max(results.currentAnnual, results.agencyAnnual);
                    const width = Math.max(8, (item.value / maxVal) * 100);
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-bold">${item.value.toLocaleString()}/yr</span>
                        </div>
                        <div className="h-3 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${width}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${item.color}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {/* Hero savings number */}
            <Card className="glass-card ring-1 ring-primary/20">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Your Projected Annual Savings</p>
                <motion.div
                  key={results.savingsVsCurrent}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl md:text-5xl font-display font-bold text-primary"
                >
                  ${results.savingsVsCurrent.toLocaleString()}
                </motion.div>
                <p className="text-sm text-muted-foreground mt-1">
                  {results.savingsPercent}% less than your current stack
                </p>
              </CardContent>
            </Card>

            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <Clock size={20} className="text-primary mx-auto mb-2" />
                  <div className="text-2xl font-display font-bold">{results.superSaasWeeks}w</div>
                  <p className="text-xs text-muted-foreground">Delivery Time</p>
                  <p className="text-[10px] text-primary mt-1">
                    {results.timeSavedWeeks} weeks faster
                  </p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <TrendingUp size={20} className="text-primary mx-auto mb-2" />
                  <div className="text-2xl font-display font-bold">{results.paybackMonths}mo</div>
                  <p className="text-xs text-muted-foreground">Payback Period</p>
                  <p className="text-[10px] text-primary mt-1">
                    Then pure savings
                  </p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <Zap size={20} className="text-primary mx-auto mb-2" />
                  <div className="text-2xl font-display font-bold">${results.superSaasMonthly.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Monthly Ops</p>
                  <p className="text-[10px] text-primary mt-1">
                    vs ${results.spend.toLocaleString()} now
                  </p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <DollarSign size={20} className="text-primary mx-auto mb-2" />
                  <div className="text-2xl font-display font-bold">${(results.superSaasOneTime / 1000).toFixed(0)}K</div>
                  <p className="text-xs text-muted-foreground">One-Time Build</p>
                  <p className="text-[10px] text-primary mt-1">
                    Custom AI-built system
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <Card className="glass-card bg-primary/5 border-primary/20">
              <CardContent className="p-5 text-center">
                <p className="text-sm mb-3">
                  Ready to save <span className="text-primary font-bold">${results.savingsVsCurrent.toLocaleString()}/year</span>?
                </p>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:brightness-110 transition-all"
                >
                  Get Your Custom Proposal <ArrowRight size={16} />
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
