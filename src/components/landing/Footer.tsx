import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      <div className="cinematic-divider" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="py-12"
      >
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="font-display font-bold text-lg cursor-pointer"
            >
              Super<span className="text-primary">SaaS</span>
            </motion.div>

            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              {["Services", "Pricing", "FAQ", "Contact"].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase()}`}
                  className="relative hover:text-foreground transition-colors duration-300 group"
                >
                  {label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </div>

            <div className="text-xs text-muted-foreground/40">
              © {new Date().getFullYear()} SuperSaaS.ai — The Agent-Native Business Rebuilder. All rights reserved.
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
