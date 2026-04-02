import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end]);
  return <>{count}{suffix}</>;
}

const stats = [
  { value: 48, suffix: "+", label: "Systems Delivered" },
  { value: 12, suffix: "+", label: "Countries Served" },
  { value: 4, suffix: ".9★", label: "Client Rating" },
  { value: 3, suffix: "x", label: "Faster Delivery" },
];

export function Hero() {
  return (
    <section className="relative pt-36 md:pt-44 pb-20 overflow-hidden">
      {/* Ambient orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[hsl(var(--ring))]/15 rounded-full blur-[150px]"
      />

      <div className="dot-grid absolute inset-0 opacity-40" />

      <div className="container-narrow relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm text-muted-foreground mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Now accepting Q2 2026 projects
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 leading-[1.1]"
        >
          <span className="text-gradient-white">Stop Paying for Software</span>
          <br />
          <span className="text-gradient-green">That Almost Fits.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          We build exactly what your business needs — custom ERP, POS, and SaaS —
          3x faster with AI-assisted architecture. Built in Jakarta. Deployed globally.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <a href="#contact" className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
            Book Architecture Call <ArrowRight size={18} />
          </a>
          <a href="#case-studies" className="btn-ghost w-full sm:w-auto text-center">
            View Case Studies
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-border"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-3xl md:text-4xl font-display font-bold mb-1 ${s.label === "Faster Delivery" ? "text-primary" : "text-foreground"}`}>
                <Counter end={s.value} suffix={s.suffix} />
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
