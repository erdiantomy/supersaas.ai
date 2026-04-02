import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "How do I know you'll actually deliver?",
    a: "We structure every project in milestones with a live staging environment after each sprint. You see working software every 2 weeks. We also offer fixed-price contracts so there are no cost overruns.",
  },
  {
    q: "What if I need changes after launch?",
    a: "The code is yours. You own it completely. We offer a Manage plan for ongoing changes, or you can hand it to your own developers. There's no lock-in, ever.",
  },
  {
    q: "How is this faster than a traditional agency?",
    a: "We use AI-assisted architecture design, automated test generation, and component scaffolding that compresses the repetitive 60% of development. Our engineers spend their time on business logic and edge cases.",
  },
  {
    q: "My business is complex. Can you handle it?",
    a: "Complex is our default setting. We've built multi-branch ERP for 47-location retail chains, offline-first POS for restaurant groups, and multi-tenant SaaS serving 5 countries.",
  },
  {
    q: "What's the minimum budget I need?",
    a: "Our simplest projects start around $8,000 USD. Enterprise ERP systems can reach $40,000+. We'll give you an honest estimate on the free architecture call.",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="section-padding bg-card/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(152_100%_45%/_0.02),transparent_60%)]" />

      <div className="max-w-3xl mx-auto px-5 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <span className="reveal-line" />
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`glass-card rounded-xl overflow-hidden transition-all duration-500 ${openIdx === i ? "border-primary/20 shadow-[0_0_30px_hsl(152_100%_45%/_0.06)]" : ""}`}
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="font-medium pr-6">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIdx === i ? 180 : 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ChevronDown
                    className={`shrink-0 transition-colors duration-300 ${openIdx === i ? "text-primary" : "text-muted-foreground"}`}
                    size={20}
                  />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
