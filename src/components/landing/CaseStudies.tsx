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
    image: caseImg1,
  },
  {
    type: "POS System",
    industry: "F&B / Restaurant Group",
    region: "Indonesia",
    result: "Eliminated $14,000/year in third-party POS subscription fees",
    metrics: ["12 outlets", "5-week delivery", "Offline-first architecture"],
    stack: "React · Node.js · SQLite",
    image: caseImg2,
  },
  {
    type: "Commercial SaaS",
    industry: "Logistics / Supply Chain",
    region: "Global (5 countries)",
    result: "Launched MVP in 6 weeks. Reached $40K MRR in 4 months.",
    metrics: ["3 pricing tiers", "Multi-tenant", "Stripe billing"],
    stack: "Next.js · FastAPI · Stripe · AWS",
    image: caseImg3,
  },
];

export function CaseStudies() {
  return (
    <section id="case-studies" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(152_100%_45%/_0.03),transparent_60%)]" />

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <span className="reveal-line !mx-0 !ml-0" />
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Proven Results</h2>
            <p className="text-lg text-muted-foreground">Real systems built for complex operations.</p>
          </div>
          <motion.a
            href="#contact"
            whileHover={{ x: 6 }}
            className="text-primary font-medium flex items-center gap-2 transition-all text-sm"
          >
            Discuss your project <ArrowRight size={18} />
          </motion.a>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60, scale: 0.93 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
              className="glass-card p-7 rounded-2xl flex flex-col h-full group"
            >
              <div className="rounded-xl overflow-hidden mb-4 border border-border">
                <motion.img
                  src={c.image}
                  alt={c.industry}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="w-full h-40 object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <div className="text-xs font-mono text-primary mb-3 uppercase tracking-wider">{c.type}</div>
              <h3 className="text-xl font-display font-bold mb-1">{c.industry}</h3>
              <div className="text-xs text-muted-foreground mb-5">{c.region}</div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 mb-6 flex-1 group-hover:bg-primary/15 transition-colors duration-500">
                <p className="text-sm font-medium text-foreground leading-relaxed">"{c.result}"</p>
              </div>

              <ul className="space-y-2 mb-6">
                {c.metrics.map((m) => (
                  <li key={m} className="flex items-center gap-2.5 text-muted-foreground text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
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
