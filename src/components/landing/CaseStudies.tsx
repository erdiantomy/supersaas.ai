import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import caseImg1 from "@/assets/case-study-1.jpg";
import caseImg2 from "@/assets/case-study-2.jpg";
import caseImg3 from "@/assets/case-study-3.jpg";

const cases = [
  {
    type: "ERP System",
    industry: "Retail / Multi-branch",
    region: "Southeast Asia",
    result: "Reduced inventory discrepancy from 23% to 1.4% in 90 days",
    metrics: ["47 store locations", "8-week delivery", "3 custom integrations"],
    stack: "Next.js · PostgreSQL · AWS",
  },
  {
    type: "POS System",
    industry: "F&B / Restaurant Group",
    region: "Indonesia",
    result: "Eliminated $14,000/year in third-party POS subscription fees",
    metrics: ["12 outlets", "5-week delivery", "Offline-first architecture"],
    stack: "React · Node.js · SQLite",
  },
  {
    type: "Commercial SaaS",
    industry: "Logistics / Supply Chain",
    region: "Global (5 countries)",
    result: "Launched MVP in 6 weeks. Reached $40K MRR in 4 months.",
    metrics: ["3 pricing tiers", "Multi-tenant", "Stripe billing"],
    stack: "Next.js · FastAPI · Stripe · AWS",
  },
];

export function CaseStudies() {
  return (
    <section id="case-studies" className="section-padding">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Proven Results</h2>
            <p className="text-lg text-muted-foreground">Real systems built for complex operations.</p>
          </div>
          <a href="#contact" className="text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all text-sm">
            Discuss your project <ArrowRight size={18} />
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              className="glass-card p-7 rounded-2xl flex flex-col h-full"
            >
              <div className="text-xs font-mono text-primary mb-3 uppercase tracking-wider">{c.type}</div>
              <h3 className="text-xl font-display font-bold mb-1">{c.industry}</h3>
              <div className="text-xs text-muted-foreground mb-5">{c.region}</div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 mb-6 flex-1">
                <p className="text-sm font-medium text-foreground leading-relaxed">"{c.result}"</p>
              </div>

              <ul className="space-y-2 mb-6">
                {c.metrics.map((m) => (
                  <li key={m} className="flex items-center gap-2.5 text-muted-foreground text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                    {m}
                  </li>
                ))}
              </ul>

              <div className="pt-5 border-t border-border text-xs font-mono text-muted-foreground/60">
                {c.stack}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
