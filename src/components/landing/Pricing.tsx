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
    <section id="pricing" className="section-padding">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fixed-price. No hourly billing. No surprises. You pay once and own it forever.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              className={`rounded-2xl p-8 flex flex-col h-full transition-all duration-300 ${
                plan.featured
                  ? "glass-card border-primary/40 shadow-[0_0_60px_hsl(152_100%_45%/_0.1)] relative"
                  : "glass-card"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
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
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-secondary-foreground">
                    <Check size={16} className="text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-all ${
                  plan.featured
                    ? "btn-primary"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta} <ArrowRight size={16} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
