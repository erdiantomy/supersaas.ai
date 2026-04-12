import { motion } from "framer-motion";
import { Search, FileCode2, Rocket, ShieldCheck, Zap, MessageSquare } from "lucide-react";

const steps = [
  { icon: MessageSquare, num: "01", title: "Describe Your Problem", time: "5 minutes", desc: "Tell our AI what your business needs in plain English. No technical knowledge required. The Discovery Agent interviews you and maps every workflow." },
  { icon: Search, num: "02", title: "Agent-Native Design", time: "48 hours", desc: "The Architect Agent designs your complete agent-native system — MCP server, tool parity matrix, sandbox config, and pricing. All reviewable by you." },
  { icon: FileCode2, num: "03", title: "Negotiate & Agree", time: "Real-time", desc: "Our Negotiation Agent handles scope, budget, and timeline discussions. Agent-Native Rebuild tier recommended for maximum future-proofing." },
  { icon: Rocket, num: "04", title: "Agents Build It", time: "2–6 weeks", desc: "12+ AI agents build MCP server, frontend, backend, agent tools, and tests in parallel. Every UI action gets a matching agent tool." },
  { icon: ShieldCheck, num: "05", title: "Validate, Deploy & Self-Optimize", time: "Continuous", desc: "Agent-Native Validator scores your build across 6 dimensions. One-click deploy. Self-optimizing agents keep improving your system forever." },
];

export function HowItWorks() {
  return (
    <section id="process" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(152_100%_45%/_0.03),transparent_60%)]" />

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="reveal-line" />
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Your Journey — 100% Autonomous
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From "I have a business problem" to "My custom system is live" — 
            entirely handled by AI agents. You just describe and approve.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-6 relative">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:block absolute top-14 left-12 right-12 h-px origin-left"
            style={{ background: "linear-gradient(90deg, transparent, hsl(152 100% 45% / 0.3), transparent)" }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 text-center group"
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.14 + 0.15, type: "spring", stiffness: 180, damping: 14 }}
                whileHover={{ scale: 1.08, boxShadow: "0 0 40px hsl(152 100% 45% / 0.15)" }}
                className="w-24 h-24 mx-auto bg-background border border-border rounded-full flex flex-col items-center justify-center mb-4 transition-all duration-500 group-hover:border-primary/40"
              >
                <step.icon size={20} className="text-primary mb-1 glow-icon" />
                <span className="text-lg font-display font-bold text-primary">{step.num}</span>
              </motion.div>
              <div className="text-[10px] font-mono text-primary/60 uppercase tracking-wider mb-2">{step.time}</div>
              <h3 className="text-sm font-display font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
