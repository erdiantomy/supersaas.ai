import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const rows = [
  { feature: "Fits your exact workflow", generic: "You adapt", custom: "Built around you" },
  { feature: "Monthly cost", generic: "$500–$5K/mo forever", custom: "One-time build fee" },
  { feature: "AI-native architecture", generic: false, custom: true },
  { feature: "Code ownership", generic: "You rent access", custom: "You own it" },
  { feature: "Custom integrations", generic: "Limited / expensive", custom: "Built-in by design" },
  { feature: "3-year total cost", generic: "$18K–$180K", custom: "$8K–$40K (paid once)" },
  { feature: "Delivery", generic: "Instant (misconfigured)", custom: "6–12 weeks (exact fit)" },
];

const fade = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export function ComparisonTable() {
  return (
    <section className="section-padding bg-card/40">
      <div className="container-narrow">
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Generic SaaS vs Super SaaS
          </h2>
          <p className="text-lg text-muted-foreground">
            Why renting software costs more than building it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="overflow-x-auto"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b border-border text-muted-foreground font-medium text-sm w-1/3">Feature</th>
                <th className="p-4 border-b border-border text-muted-foreground font-medium text-sm w-1/3">Generic SaaS</th>
                <th className="p-4 border-b border-primary/30 text-primary font-display font-bold text-lg w-1/3 bg-primary/5 rounded-t-xl">
                  Super SaaS
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.06 }}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="p-4 text-secondary-foreground text-sm">{row.feature}</td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {typeof row.generic === "boolean" ? (
                      row.generic ? <Check size={18} className="text-primary" /> : <X size={18} className="text-destructive" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <X size={14} className="text-destructive shrink-0" />
                        {row.generic}
                      </span>
                    )}
                  </td>
                  <td className="p-4 bg-primary/5 text-sm">
                    {typeof row.custom === "boolean" ? (
                      row.custom ? <Check size={18} className="text-primary" /> : <X size={18} />
                    ) : (
                      <span className="flex items-center gap-2 text-foreground font-medium">
                        <Check size={14} className="text-primary shrink-0" />
                        {row.custom}
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
