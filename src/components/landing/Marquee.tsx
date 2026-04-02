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
      transition={{ duration: 0.8 }}
      className="py-12 border-y border-border overflow-hidden"
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {[...logos, ...logos].map((logo, i) => (
          <span
            key={i}
            className="mx-10 text-sm font-medium text-muted-foreground/50 uppercase tracking-[0.2em] font-display"
          >
            {logo}
          </span>
        ))}
      </div>
    </motion.section>
  );
}
