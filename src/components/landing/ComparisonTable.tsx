import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

const rows = [
  { feature: "Fits your exact workflow", saas: "You adapt to it", agency: "Eventually", supersaas: "Built around you" },
  { feature: "Time to production", saas: "Instant (misconfigured)", agency: "6–18 months", supersaas: "4–8 weeks" },
  { feature: "AI-native from day 1", saas: false, agency: false, supersaas: true },
  { feature: "Code & IP ownership", saas: "You rent access", agency: "Depends on contract", supersaas: "You own 100%" },
  { feature: "Post-launch iteration", saas: "Wait for vendor roadmap", agency: "New SOW + 8 weeks", supersaas: "AI agents iterate in days" },
  { feature: "Autonomous monitoring", saas: false, agency: false, supersaas: true },
  { feature: "Cost to change a feature", saas: "Not possible", agency: "$5K–$20K per change", supersaas: "Included in Managed tier" },
  { feature: "3-year total cost", saas: "$36K–$180K", agency: "$200K–$500K+", supersaas: "$12K–$60K (you own it)" },
];

function CellContent({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? <Check size={18} className="text-primary glow-icon" /> : <X size={18} className="text-destructive" />;
  }
  return <span>{value}</span>;
}

export function ComparisonTable() {
  return (
    <section className="section-padding bg-card/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(152_100%_45%/_0.02),transparent_60%)]" />

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="reveal-line" />
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            The Real Comparison
          </h2>
          <p className="text-lg text-muted-foreground">
            Generic SaaS vs Traditional Agency vs Agent-Powered.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-x-auto"
        >
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="p-4 border-b border-border text-muted-foreground font-medium text-sm w-1/4">Feature</th>
                <th className="p-4 border-b border-border text-muted-foreground font-medium text-sm w-1/4">Generic SaaS</th>
                <th className="p-4 border-b border-border text-muted-foreground font-medium text-sm w-1/4">Traditional Agency</th>
                <th className="p-4 border-b border-primary/30 text-primary font-display font-bold text-base w-1/4 bg-primary/5 rounded-t-xl">
                  SuperSaaS <span className="text-xs font-normal text-primary/60">(Agent-Powered)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors duration-300"
                >
                  <td className="p-4 text-secondary-foreground text-sm font-medium">{row.feature}</td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {typeof row.saas === "boolean" ? (
                      <CellContent value={row.saas} />
                    ) : (
                      <span className="flex items-center gap-2">
                        <X size={14} className="text-destructive shrink-0" />
                        {row.saas}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {typeof row.agency === "boolean" ? (
                      <CellContent value={row.agency} />
                    ) : (
                      <span className="flex items-center gap-2">
                        <Minus size={14} className="text-muted-foreground/50 shrink-0" />
                        {row.agency}
                      </span>
                    )}
                  </td>
                  <td className="p-4 bg-primary/5 text-sm">
                    {typeof row.supersaas === "boolean" ? (
                      <CellContent value={row.supersaas} />
                    ) : (
                      <span className="flex items-center gap-2 text-foreground font-medium">
                        <Check size={14} className="text-primary shrink-0 glow-icon" />
                        {row.supersaas}
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
