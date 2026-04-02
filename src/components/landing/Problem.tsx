import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export function Problem() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-narrow text-center">
        <motion.h2
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-display font-bold mb-8 leading-tight"
        >
          You're paying{" "}
          <span className="text-destructive">$2,000/month</span> for software
          that forces you to change how you work.
        </motion.h2>

        <motion.p
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-muted-foreground mb-14 leading-relaxed max-w-3xl mx-auto"
        >
          Generic SaaS tools are built for the "average" business. So you end up
          with spreadsheets, manual data entry, and a system that slows your
          team down instead of speeding them up.
        </motion.p>

        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-8 md:p-10 rounded-2xl border-destructive/20 relative"
        >
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
            The SaaS Trap
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14">
            {[
              { label: "Year 1", value: "$24,000" },
              { label: "Year 3", value: "$72,000" },
              { label: "You Own", value: "Nothing", destructive: true },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="text-center flex items-center gap-8 md:gap-14"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
              >
                {i > 0 && <ArrowRight className="text-destructive rotate-90 md:rotate-0" size={24} />}
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{item.label}</div>
                  <div className={`text-3xl font-mono font-bold ${item.destructive ? "text-destructive font-display" : "text-secondary-foreground"}`}>
                    {item.value}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
