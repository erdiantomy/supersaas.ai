import { motion } from "framer-motion";
import { Database, ShoppingCart, Cloud, Plug } from "lucide-react";

const services = [
  {
    icon: Database,
    title: "Custom ERP",
    desc: "Multi-branch inventory, HR, finance, and operations — built around your exact workflow, not a template.",
    tags: ["Multi-branch", "Real-time sync", "Custom reports"],
  },
  {
    icon: ShoppingCart,
    title: "POS Systems",
    desc: "Offline-first point-of-sale with custom pricing logic, loyalty programs, and hardware integration.",
    tags: ["Offline-first", "Multi-outlet", "Custom pricing"],
  },
  {
    icon: Cloud,
    title: "SaaS Products",
    desc: "From MVP to scale — multi-tenant architecture, billing integration, and analytics built in from day one.",
    tags: ["Multi-tenant", "Stripe billing", "Analytics"],
  },
  {
    icon: Plug,
    title: "API & Integration",
    desc: "Connect your existing tools with custom middleware, data pipelines, and real-time sync.",
    tags: ["REST / GraphQL", "Webhooks", "ETL pipelines"],
  },
];

export function Services() {
  return (
    <section id="services" className="section-padding bg-card/40">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">What We Build</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complex systems that generic SaaS can't handle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="glass-card p-8 rounded-2xl group hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                  <s.icon size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{s.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.tags.map((t) => (
                      <span key={t} className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
