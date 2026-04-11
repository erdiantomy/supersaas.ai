import { motion } from "framer-motion";

const partners = [
  "OpenAI", "Google Cloud", "AWS", "Vercel", "Stripe",
  "Anthropic", "PostgreSQL", "React", "Supabase", "Figma",
];

export function TechPartners() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="py-14 border-y border-border overflow-hidden relative"
    >
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/50 font-medium">
          Powered by world-class technology
        </p>
      </div>
      
      <div className="flex animate-marquee whitespace-nowrap">
        {[...partners, ...partners].map((name, i) => (
          <span
            key={i}
            className="mx-10 text-sm font-medium text-muted-foreground/40 uppercase tracking-[0.2em] font-display hover:text-primary/60 transition-colors duration-500"
          >
            {name}
          </span>
        ))}
      </div>
    </motion.section>
  );
}
