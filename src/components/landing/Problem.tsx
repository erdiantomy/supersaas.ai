import { motion, useScroll, useTransform } from "framer-motion";
import { DollarSign, AlertTriangle, Clock } from "lucide-react";
import { useRef } from "react";

const cinematic = {
  hidden: { opacity: 0, y: 50, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const painPoints = [
  {
    icon: DollarSign,
    title: "The Cost Trap",
    desc: "You're renting software you'll never own. $2K/month × 3 years = $72,000 with zero equity.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
  },
  {
    icon: AlertTriangle,
    title: "The Capability Gap",
    desc: "Generic tools can't handle your workflow complexity. So you hack around them with spreadsheets and manual processes.",
    color: "text-[hsl(45,100%,60%)]",
    bgColor: "bg-[hsl(45,100%,60%/0.1)]",
    borderColor: "border-[hsl(45,100%,60%/0.2)]",
  },
  {
    icon: Clock,
    title: "The Speed Tax",
    desc: "Traditional agencies take 6–18 months and $200K+. Your market won't wait. Your competitors aren't waiting.",
    color: "text-[hsl(200,100%,60%)]",
    bgColor: "bg-[hsl(200,100%,60%/0.1)]",
    borderColor: "border-[hsl(200,100%,60%/0.2)]",
  },
];

export function Problem() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(0_72%_51%/_0.04),transparent_60%)]" />

      <motion.div style={{ y }} className="container-wide text-center relative z-10">
        <span className="reveal-line" />
        <motion.h2
          variants={cinematic}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-3xl md:text-5xl font-display font-bold mb-6 leading-tight"
        >
          Three Forces Killing{" "}
          <motion.span
            className="text-destructive inline-block"
            whileInView={{ scale: [1, 1.1, 1] }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Your Growth
          </motion.span>
        </motion.h2>

        <motion.p
          variants={cinematic}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.15 }}
          className="text-lg text-muted-foreground mb-14 leading-relaxed max-w-3xl mx-auto"
        >
          Every business hits these walls. The ones that break through build their own systems.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6">
          {painPoints.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 50, scale: 0.93 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
              className={`glass-card p-8 rounded-2xl transition-all duration-500 hover:shadow-lg ${p.borderColor} border group text-left`}
            >
              <motion.div
                initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
                whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 + 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className={`w-14 h-14 ${p.bgColor} rounded-2xl flex items-center justify-center mb-6 ${p.color} transition-colors duration-500`}
              >
                <p.icon size={26} />
              </motion.div>
              <h3 className={`text-xl font-display font-bold mb-3 ${p.color}`}>{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
