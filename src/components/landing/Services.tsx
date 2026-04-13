import { motion } from "framer-motion";
import { ShoppingBag, Truck, Landmark, HeartPulse } from "lucide-react";
import demoErp from "@/assets/demo-erp.jpg";
import demoPos from "@/assets/demo-pos.jpg";
import demoSaas from "@/assets/demo-saas.jpg";

const domains = [
  {
    icon: ShoppingBag,
    title: "Retail & Commerce",
    desc: "Agent-native POS, inventory, and omnichannel — every operation has an agent tool. Replace 4 SaaS tools with one system you own.",
    tags: ["Agent-Native POS", "MCP-Ready Inventory", "Self-Optimizing Loyalty"],
    image: demoErp,
    features: [
      "Multi-branch inventory with real-time sync across 50+ locations",
      "Offline-first POS with automatic cloud reconciliation",
      "AI agents that auto-optimize pricing and customer segmentation",
    ],
  },
  {
    icon: Truck,
    title: "Logistics & Supply Chain",
    desc: "Agent-native route optimization, warehouse management, and fleet tracking — self-optimizing agents run your operations 24/7.",
    tags: ["Agent-Native Routing", "MCP Warehouse", "Self-Optimizing Fleet"],
    image: demoPos,
    features: [
      "AI-optimized delivery routes saving 30% on fuel costs",
      "Barcode/RFID warehouse with agent-callable pick-pack-ship tools",
      "Real-time fleet tracking with autonomous dispatch agents",
    ],
  },
  {
    icon: Landmark,
    title: "Financial Services",
    desc: "Agent-native compliance, portfolio analytics, and payment orchestration — sandbox-governed agents with full audit trails.",
    tags: ["Agent-Native Compliance", "Sandboxed Analytics", "MCP Payments"],
    image: demoSaas,
    features: [
      "Automated KYC/AML compliance with agent audit trail",
      "Self-optimizing portfolio analytics with risk scoring",
      "Multi-gateway payment orchestration with agent failover",
    ],
  },
];

const extraDomain = {
  icon: HeartPulse,
  title: "Healthcare & Operations",
  desc: "Agent-native patient flow, scheduling intelligence, and regulatory compliance — HIPAA-ready with sandbox governance from day one.",
  tags: ["Agent-Native Scheduling", "Sandboxed HIPAA", "Self-Optimizing Ops"],
};

export function Services() {
  return (
    <section id="services" className="section-padding bg-card/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(152_100%_45%/_0.03),transparent_70%)]" />

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="reveal-line" />
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Solution Domains</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We don't build generic software. We build industry-specific systems powered by AI agents that understand your vertical.
          </p>
        </motion.div>

        <div className="space-y-8 mb-8">
          {domains.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-2xl overflow-hidden group hover:border-primary/20 transition-all duration-500"
            >
              <div className={`grid md:grid-cols-2 gap-0 ${i % 2 === 1 ? "md:direction-rtl" : ""}`}>
                <div className={`relative overflow-hidden ${i % 2 === 1 ? "md:order-2" : ""}`}>
                  <motion.img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    width={960}
                    height={640}
                    className="w-full h-64 md:h-full object-cover"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-card/40" />
                </div>

                <div className={`p-8 md:p-10 flex flex-col justify-center ${i % 2 === 1 ? "md:order-1" : ""}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 mb-4"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary glow-icon">
                      <s.icon size={20} />
                    </div>
                    <h3 className="text-2xl font-display font-bold">{s.title}</h3>
                  </motion.div>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{s.desc}</p>

                  <ul className="space-y-3 mb-6">
                    {s.features.map((f, fi) => (
                      <motion.li
                        key={fi}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + fi * 0.1 }}
                        className="flex items-start gap-2.5 text-sm text-foreground/80"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {f}
                      </motion.li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    {s.tags.map((t) => (
                      <span key={t} className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.01 }}
          className="glass-card p-8 rounded-2xl group hover:border-primary/20 transition-all duration-500"
        >
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors glow-icon">
              <extraDomain.icon size={22} />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold mb-2">{extraDomain.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{extraDomain.desc}</p>
              <div className="flex flex-wrap gap-2">
                {extraDomain.tags.map((t) => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
