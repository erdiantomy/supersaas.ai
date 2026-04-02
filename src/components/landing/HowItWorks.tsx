import { motion } from "framer-motion";
import { Phone, FileCode2, Rocket, KeyRound } from "lucide-react";

const steps = [
  { icon: Phone, num: "01", title: "Architecture Call", desc: "We map your business logic, identify bottlenecks, and determine if custom software is actually the right move." },
  { icon: FileCode2, num: "02", title: "AI-Assisted Blueprint", desc: "Within 48 hours, you get a complete technical architecture, database schema, and fixed-price quote." },
  { icon: Rocket, num: "03", title: "Sprint & Review", desc: "We build in 2-week sprints. You test features on a live staging environment as they're completed." },
  { icon: KeyRound, num: "04", title: "Handover & Ownership", desc: "Full source code and IP rights. We deploy to your servers. You own everything." },
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
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">How We Work</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A transparent, milestone-driven process designed to eliminate surprises.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Animated connecting line */}
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
              transition={{ duration: 0.7, delay: i * 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 text-center group"
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.18 + 0.15, type: "spring", stiffness: 180, damping: 14 }}
                whileHover={{ scale: 1.08, boxShadow: "0 0 40px hsl(152 100% 45% / 0.15)" }}
                className="w-28 h-28 mx-auto bg-background border border-border rounded-full flex flex-col items-center justify-center mb-6 transition-all duration-500 group-hover:border-primary/40"
              >
                <step.icon size={22} className="text-primary mb-1 glow-icon" />
                <span className="text-xl font-display font-bold text-primary">{step.num}</span>
              </motion.div>
              <h3 className="text-lg font-display font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
