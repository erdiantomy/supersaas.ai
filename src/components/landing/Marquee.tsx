import { motion } from "framer-motion";

const logos = [
  "Google Cloud", "AWS", "Stripe", "Vercel", "Supabase",
  "Next.js", "PostgreSQL", "React", "Node.js", "Figma",
];

export function Marquee() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="py-12 border-y border-border overflow-hidden relative"
    >
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
      
      <div className="flex animate-marquee whitespace-nowrap">
        {[...logos, ...logos].map((logo, i) => (
          <span
            key={i}
            className="mx-10 text-sm font-medium text-muted-foreground/40 uppercase tracking-[0.2em] font-display hover:text-primary/60 transition-colors duration-500"
          >
            {logo}
          </span>
        ))}
      </div>
    </motion.section>
  );
}
