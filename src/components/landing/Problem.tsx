import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

const cinematic = {
  hidden: { opacity: 0, y: 50, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export function Problem() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(0_72%_51%/_0.04),transparent_60%)]" />

      <motion.div style={{ y }} className="container-narrow text-center relative z-10">
        <span className="reveal-line" />
        <motion.h2
          variants={cinematic}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-3xl md:text-5xl font-display font-bold mb-8 leading-tight"
        >
          You're paying{" "}
          <motion.span
            className="text-destructive inline-block"
            whileInView={{ scale: [1, 1.1, 1] }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            $2,000/month
          </motion.span>{" "}
          for software that forces you to change how you work.
        </motion.h2>

        <motion.p
          variants={cinematic}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.15 }}
          className="text-lg text-muted-foreground mb-14 leading-relaxed max-w-3xl mx-auto"
        >
          Generic SaaS tools are built for the "average" business. So you end up
          with spreadsheets, manual data entry, and a system that slows your
          team down instead of speeding them up.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-8 md:p-10 rounded-2xl border-destructive/20 relative animate-glow-pulse"
          style={{ animationDuration: "6s" }}
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
                initial={{ opacity: 0, scale: 0.7, rotateX: 30 }}
                whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.18, ease: [0.16, 1, 0.3, 1] }}
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
      </motion.div>
    </section>
  );
}
