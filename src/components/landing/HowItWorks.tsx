import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Architecture Call", desc: "We map your business logic, identify bottlenecks, and determine if custom software is actually the right move." },
  { num: "02", title: "AI-Assisted Blueprint", desc: "Within 48 hours, you get a complete technical architecture, database schema, and fixed-price quote." },
  { num: "03", title: "Sprint & Review", desc: "We build in 2-week sprints. You test features on a live staging environment as they're completed." },
  { num: "04", title: "Handover & Ownership", desc: "Full source code and IP rights. We deploy to your servers. You own everything." },
];

const fade = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export function HowItWorks() {
  return (
    <section id="process" className="section-padding">
      <div className="container-wide">
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">How We Work</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A transparent, milestone-driven process designed to eliminate surprises.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-12 right-12 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative z-10 text-center"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 + 0.1, type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 mx-auto bg-background border border-border rounded-full flex items-center justify-center mb-6"
              >
                <span className="text-3xl font-display font-bold text-primary">{step.num}</span>
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
