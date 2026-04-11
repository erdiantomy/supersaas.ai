import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Launch",
    price: "$12K",
    priceDetail: "one-time",
    desc: "MVP with agent-built foundation. Go from idea to live product in 4 weeks.",
    features: [
      "Up to 5 core modules",
      "4 AI agents deployed",
      "4-week delivery guarantee",
      "Full source code & IP ownership",
      "3 months bug support",
      "Live staging environment",
    ],
    cta: "Start Building",
    featured: false,
  },
  {
    name: "Scale",
    price: "$25K",
    priceDetail: "+ $2K/mo managed",
    desc: "Full enterprise system with autonomous monitoring and continuous AI optimization.",
    features: [
      "Up to 20 modules",
      "Full agent swarm (12+ agents)",
      "6-week delivery guarantee",
      "AI monitoring & auto-alerting",
      "Continuous optimization by agents",
      "6 months priority support",
      "Performance benchmarking",
    ],
    cta: "Book Architecture Call",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    priceDetail: "dedicated agent fleet",
    desc: "Dedicated agent fleet with SLA, on-prem options, and 24/7 managed AI operations.",
    features: [
      "Unlimited modules & integrations",
      "Dedicated agent fleet",
      "On-premise deployment option",
      "SLA with 99.9% uptime guarantee",
      "24/7 managed AI operations",
      "12 months premium support",
      "HIPAA / SOC2 compliance ready",
    ],
    cta: "Contact Us",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(152_100%_45%/_0.04),transparent_60%)]" />

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
            Invest Once. Own Forever.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fixed-price builds with optional managed AI operations. No hourly billing. No surprises.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
              className={`rounded-2xl p-8 flex flex-col h-full transition-all duration-500 ${
                plan.featured
                  ? "glass-card border-primary/40 shadow-[0_0_60px_hsl(152_100%_45%/_0.1)] relative"
                  : "glass-card hover:border-primary/20"
              }`}
            >
              {plan.featured && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider"
                >
                  Most Popular
                </motion.div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-display font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                <div className="text-4xl font-display font-bold text-foreground">
                  {plan.price}
                  <span className="text-sm text-muted-foreground font-normal ml-1">{plan.priceDetail}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, fi) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + fi * 0.06 }}
                    className="flex items-start gap-3 text-sm text-secondary-foreground"
                  >
                    <Check size={16} className="text-primary mt-0.5 shrink-0 glow-icon" />
                    {f}
                  </motion.li>
                ))}
              </ul>

              <motion.a
                href="#contact"
                whileHover={{ scale: 1.04, boxShadow: plan.featured ? "0 0 50px hsl(152 100% 45% / 0.3)" : "none" }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-all ${
                  plan.featured
                    ? "btn-primary"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta} <ArrowRight size={16} />
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
