import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "How do I know you'll actually deliver?",
    a: "We structure every project in milestones with a live staging environment after each sprint. You see working software every 2 weeks. We also offer fixed-price contracts so there are no cost overruns.",
  },
  {
    q: "What AI models do you use?",
    a: "We orchestrate multiple frontier models — GPT-5, Gemini 2.5 Pro, Claude 4 — each selected for specific tasks. Discovery uses language models. Architecture uses code-specialized models. QA uses security-focused models. The right tool for each job.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. We run a SOC2-compliant pipeline. Your data never leaves your cloud infrastructure. We support data residency requirements for EU, APAC, and US regions. HIPAA-ready architectures available for healthcare clients.",
  },
  {
    q: "What happens if AI makes a mistake?",
    a: "Every agent output is validated by our QA Agent layer and human engineer review checkpoints. Our Builder Swarm generates 800+ automated tests per project. We maintain a zero-bug tolerance policy before production deployment.",
  },
  {
    q: "What if I need changes after launch?",
    a: "The code is yours — you own it completely. Our Scale and Enterprise plans include Managed AI Ops where agents continuously monitor, suggest improvements, and implement changes. Or hand it to your own developers. No lock-in, ever.",
  },
  {
    q: "How is this faster than a traditional agency?",
    a: "Traditional agencies assign 3-5 developers working sequentially. We deploy 8-16 AI agents working in parallel — frontend, backend, tests, and migrations simultaneously. Human engineers supervise and handle the complex business logic and edge cases.",
  },
  {
    q: "Can I bring my own AI keys (BYOK)?",
    a: "Yes. Enterprise clients can use their own API keys for AI model access. This gives you full control over usage, billing, and data governance. We support OpenAI, Google, and Anthropic BYOK configurations.",
  },
  {
    q: "What's the minimum budget I need?",
    a: "Our Launch tier starts at $12,000 for an MVP with up to 5 modules, delivered in 4 weeks. Enterprise systems with full agent fleets and managed operations are custom-quoted. We'll give you an honest estimate on the architecture call.",
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
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
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
