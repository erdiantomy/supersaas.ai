import { motion } from "framer-motion";
import { Search, Cpu, Users, ShieldCheck } from "lucide-react";
import { useState } from "react";

const agents = [
  {
    icon: Search,
    title: "Discovery Agent",
    desc: "Interviews stakeholders, maps workflows, and generates complete requirements docs — autonomously in 72 hours.",
    metrics: "Avg. 47 workflows mapped per project",
    color: "from-[hsl(200,100%,60%)] to-[hsl(220,100%,65%)]",
    glowColor: "hsl(200 100% 60% / 0.15)",
  },
  {
    icon: Cpu,
    title: "Architect Agent",
    desc: "Designs database schemas, API contracts, and component hierarchies from your business rules. Reviewed by senior engineers.",
    metrics: "Blueprint delivered in 48hrs",
    color: "from-[hsl(280,100%,65%)] to-[hsl(300,100%,70%)]",
    glowColor: "hsl(280 100% 65% / 0.15)",
  },
  {
    icon: Users,
    title: "Builder Swarm",
    desc: "Multiple specialized agents write frontend, backend, tests, and migrations in parallel. Human engineers review every commit.",
    metrics: "12 agents working simultaneously",
    color: "from-primary to-[hsl(170,80%,55%)]",
    glowColor: "hsl(152 100% 45% / 0.15)",
  },
  {
    icon: ShieldCheck,
    title: "QA Agent",
    desc: "Automated regression testing, load testing, and security scanning before every deployment. Zero-bug tolerance.",
    metrics: "847 automated tests avg. per project",
    color: "from-[hsl(45,100%,60%)] to-[hsl(30,100%,55%)]",
    glowColor: "hsl(45 100% 60% / 0.15)",
  },
];

export function AgentStack() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(152_100%_45%/_0.04),transparent_60%)]" />

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
            The Agent Stack
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four autonomous AI agents work in concert — each specialized, each supervised by senior engineers. 
            This is how we deliver enterprise systems in weeks, not months.
          </p>
        </motion.div>

        {/* Connection flow line */}
        <div className="relative">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block absolute top-1/2 left-8 right-8 h-px origin-left"
            style={{ background: "linear-gradient(90deg, hsl(200 100% 60% / 0.4), hsl(280 100% 65% / 0.4), hsl(152 100% 45% / 0.4), hsl(45 100% 60% / 0.4))" }}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.title}
                initial={{ opacity: 0, y: 50, scale: 0.93 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.3 } }}
                onHoverStart={() => setActiveIdx(i)}
                onHoverEnd={() => setActiveIdx(null)}
                className="glass-card p-7 rounded-2xl transition-all duration-500 hover:border-primary/30 group relative"
                style={{
                  boxShadow: activeIdx === i ? `0 0 60px ${agent.glowColor}` : "none",
                }}
              >
                {/* Step number */}
                <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground/40">
                  0{i + 1}
                </div>

                <motion.div
                  initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
                  whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 + 0.2, type: "spring", stiffness: 200, damping: 15 }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${agent.color} text-background`}
                >
                  <agent.icon size={26} />
                </motion.div>

                <h3 className="text-lg font-display font-bold mb-3">{agent.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm mb-4">{agent.desc}</p>
                
                <div className="text-xs font-mono text-primary/80 bg-primary/5 px-3 py-1.5 rounded-full inline-block">
                  {agent.metrics}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom trust statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">Every output is human-reviewed.</span>{" "}
            AI builds at speed. Engineers ensure quality. You get both.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
