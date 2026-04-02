import { motion } from "framer-motion";
import { Database, ShoppingCart, Cloud, Plug } from "lucide-react";
import demoErp from "@/assets/demo-erp.jpg";
import demoPos from "@/assets/demo-pos.jpg";
import demoSaas from "@/assets/demo-saas.jpg";

const heroServices = [
  {
    icon: Database,
    title: "Custom ERP",
    desc: "Multi-branch inventory, HR, finance, and operations — built around your exact workflow, not a template.",
    tags: ["Multi-branch", "Real-time sync", "Custom reports"],
    image: demoErp,
    features: [
      "Warehouse & inventory management across 50+ locations",
      "Automated purchase orders & supplier tracking",
      "Real-time financial dashboards with role-based access",
    ],
  },
  {
    icon: ShoppingCart,
    title: "POS Systems",
    desc: "Offline-first point-of-sale with custom pricing logic, loyalty programs, and hardware integration.",
    tags: ["Offline-first", "Multi-outlet", "Custom pricing"],
    image: demoPos,
    features: [
      "Works without internet — syncs when back online",
      "Kitchen display, receipt printer & payment terminal integration",
      "Custom loyalty programs & dynamic pricing rules",
    ],
  },
  {
    icon: Cloud,
    title: "SaaS Products",
    desc: "From MVP to scale — multi-tenant architecture, billing integration, and analytics built in from day one.",
    tags: ["Multi-tenant", "Stripe billing", "Analytics"],
    image: demoSaas,
    features: [
      "Multi-tenant architecture with data isolation",
      "Subscription billing with Stripe or local gateways",
      "Usage analytics & customer success dashboards",
    ],
  },
];

const extraService = {
  icon: Plug,
  title: "API & Integration",
  desc: "Connect your existing tools with custom middleware, data pipelines, and real-time sync.",
  tags: ["REST / GraphQL", "Webhooks", "ETL pipelines"],
};

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

        {/* Hero service cards with visual demos */}
        <div className="space-y-8 mb-8">
          {heroServices.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-card rounded-2xl overflow-hidden group hover:border-primary/20 transition-all duration-300"
            >
              <div className={`grid md:grid-cols-2 gap-0 ${i % 2 === 1 ? "md:direction-rtl" : ""}`}>
                {/* Image side */}
                <div className={`relative overflow-hidden ${i % 2 === 1 ? "md:order-2" : ""}`}>
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    width={960}
                    height={640}
                    className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-card/40" />
                </div>

                {/* Content side */}
                <div className={`p-8 md:p-10 flex flex-col justify-center ${i % 2 === 1 ? "md:order-1" : ""}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <s.icon size={20} />
                    </div>
                    <h3 className="text-2xl font-display font-bold">{s.title}</h3>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{s.desc}</p>

                  <ul className="space-y-3 mb-6">
                    {s.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

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

        {/* Extra service card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 rounded-2xl group hover:border-primary/20 transition-all duration-300"
        >
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
              <extraService.icon size={22} />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold mb-2">{extraService.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{extraService.desc}</p>
              <div className="flex flex-wrap gap-2">
                {extraService.tags.map((t) => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
