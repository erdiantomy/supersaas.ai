import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Bot, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
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
  { value: 200, suffix: "+", label: "Agent Deployments" },
  { value: 14, suffix: "", label: "Industries" },
  { value: 92, suffix: "%", label: "Automation Rate" },
  { value: 10, suffix: "x", label: "Faster Than Agency", highlight: true },
];

const EASE = [0.16, 1, 0.3, 1] as const;

const cinematic = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      delay: i * 0.15,
      ease: EASE as unknown as [number, number, number, number],
    },
  }),
};

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative pt-36 md:pt-44 pb-20 overflow-hidden min-h-[100vh]">
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0">
        <img src={heroBg} alt="" width={1920} height={1080} className="w-full h-full object-cover opacity-35" />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background))_100%)]" />

      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[200px]"
      />
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[hsl(var(--ring))]/10 rounded-full blur-[200px]"
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        />
      </div>

      <div className="dot-grid absolute inset-0 opacity-30" />

      <motion.div style={{ opacity: contentOpacity }} className="container-narrow relative z-10 text-center">
        <motion.div
          custom={0}
          variants={cinematic}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm text-muted-foreground mb-8"
        >
          <Bot size={14} className="text-primary glow-icon" />
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          100% Agent-Native Platform — Now Live
        </motion.div>

        <motion.h1
          custom={1}
          variants={cinematic}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 leading-[1.1]"
        >
          <span className="text-gradient-white">The Agent-Native</span>
          <br />
          <span className="text-gradient-white">Business Rebuilder.</span>
          <br />
          <span className="text-gradient-green">MCP-Ready. Self-Optimizing.</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={cinematic}
          initial="hidden"
          animate="visible"
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          The world's first Agent-Native Business Rebuilder.
          Every UI action has an agent tool. Every agent has a sandbox.
          MCP-compatible, self-optimizing — 10× faster, 80% cheaper than any agency.
        </motion.p>

        <motion.div
          custom={3}
          variants={cinematic}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <motion.a
            href="/auth"
            whileHover={{ scale: 1.05, boxShadow: "0 0 60px hsl(152 100% 45% / 0.35)" }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Zap size={18} /> Rebuild Agent-Native — Start Free
          </motion.a>
          <motion.a
            href="#process"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-ghost w-full sm:w-auto text-center"
          >
            See How It Works <ArrowRight size={16} className="ml-1" />
          </motion.a>
        </motion.div>

        <motion.div
          custom={4}
          variants={cinematic}
          initial="hidden"
          animate="visible"
          className="pt-12"
        >
          <div className="cinematic-divider mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="text-center group"
              >
                <div className={`text-3xl md:text-4xl font-display font-bold mb-1 transition-all duration-500 group-hover:drop-shadow-[0_0_12px_hsl(152_100%_45%/_0.4)] ${s.highlight ? "text-primary" : "text-foreground"}`}>
                  <Counter end={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
