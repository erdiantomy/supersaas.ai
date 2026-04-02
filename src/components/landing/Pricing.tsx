import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$8K",
    desc: "Perfect for MVPs and internal tools",
    features: [
      "Up to 5 core modules",
      "Basic integrations",
      "4-week delivery",
      "3 months bug support",
      "Full source code ownership",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Growth",
    price: "$18K",
    desc: "For scaling businesses with complex workflows",
    features: [
      "Up to 15 modules",
      "AI-assisted architecture",
      "Custom integrations",
      "6-week delivery",
      "6 months priority support",
      "Performance optimization",
    ],
    cta: "Book Architecture Call",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "$35K+",
    desc: "Multi-branch ERP and enterprise SaaS",
    features: [
      "Unlimited modules",
      "Multi-tenant / multi-branch",
      "Dedicated project manager",
      "12-week delivery",
      "12 months premium support",
      "SLA guarantee",
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
            Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fixed-price. No hourly billing. No surprises. You pay once and own it forever.
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
                  <span className="text-sm text-muted-foreground font-normal ml-1">one-time</span>
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
