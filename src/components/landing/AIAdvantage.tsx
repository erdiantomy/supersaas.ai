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

export function AIAdvantage() {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            The AI Advantage
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Custom software used to be too slow and expensive. AI changed that.
            We pass the advantage to you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              className="glass-card p-8 rounded-2xl transition-all duration-300 hover:border-primary/30 hover:shadow-[var(--glow-green)]"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                <c.icon size={24} />
              </div>
              <h3 className="text-xl font-display font-bold mb-3">{c.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
