import { motion } from "framer-motion";
import { Zap, DollarSign, BrainCircuit } from "lucide-react";

const cards = [
  {
    icon: Zap,
    title: "3x Faster Delivery",
    desc: "AI-assisted scaffolding, automated testing, and schema generation compresses 6-month projects into 6–8 weeks.",
  },
  {
    icon: DollarSign,
    title: "Lower Total Cost",
    desc: "Fewer engineering hours. No bloated teams. AI handles the repetitive 60% so humans focus on your business logic.",
  },
  {
    icon: BrainCircuit,
    title: "Smarter Architecture",
    desc: "AI analyzes your workflows to generate optimal database schemas, API structures, and component hierarchies.",
  },
];

const cinematic = {
  hidden: { opacity: 0, y: 50, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export function AIAdvantage() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(152_100%_45%/_0.04),transparent_60%)]" />

      <div className="container-wide relative z-10">
        <motion.div
          variants={cinematic}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <span className="reveal-line" />
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            The AI Advantage
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Custom software used to be too slow and expensive. AI changed that.
            We pass the advantage to you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.93 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
              className="glass-card p-8 rounded-2xl transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_60px_hsl(152_100%_45%/_0.12)] group"
            >
              <motion.div
                initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
                whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 + 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary/20 transition-colors duration-500 glow-icon"
              >
                <c.icon size={26} />
              </motion.div>
              <h3 className="text-xl font-display font-bold mb-3">{c.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
