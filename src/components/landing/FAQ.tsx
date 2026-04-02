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
    <section id="faq" className="section-padding bg-card/40">
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-12 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="font-medium pr-6">{faq.q}</span>
                <ChevronDown
                  className={`shrink-0 transition-transform duration-300 ${
                    openIdx === i ? "rotate-180 text-primary" : "text-muted-foreground"
                  }`}
                  size={20}
                />
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
