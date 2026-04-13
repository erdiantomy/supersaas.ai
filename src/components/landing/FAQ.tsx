import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "What does 'agent-native' actually mean?",
    a: "Agent-native means your system is built from the ground up so AI agents can operate it — not just humans. Every UI action has a corresponding agent tool. Every API is self-documenting. Every agent runs in an isolated sandbox with audit logging. Your system exposes an MCP server so any external AI can discover and use its capabilities.",
  },
  {
    q: "How do I know you'll actually deliver?",
    a: "We structure every project in milestones with a live staging environment after each sprint. You see working software every 2 weeks. We also offer fixed-price contracts so there are no cost overruns.",
  },
  {
    q: "What is MCP (Model Context Protocol)?",
    a: "MCP is the open standard for AI agents to discover and use tools. We auto-generate an MCP server for every system we build, meaning any AI — Claude, GPT, Gemini, or your own — can interact with your business system programmatically. It's like giving your business an API that AI agents natively understand.",
  },
  {
    q: "Is my data safe with agents running?",
    a: "Every agent runs in a governed sandbox with memory limits, network restrictions, and full audit logging. We follow the principle that 'every agent needs a box.' SOC2-compliant pipeline, data residency support for EU/APAC/US, and HIPAA-ready architectures for healthcare.",
  },
  {
    q: "What happens if an agent makes a mistake?",
    a: "Every agent output passes through our Agent-Native Validator, which scores the build across 6 dimensions. Builds must score 80/100+ to ship. Agents requiring dangerous operations trigger human-in-the-loop approval gates. You stay in control.",
  },
  {
    q: "What if I need changes after launch?",
    a: "The code is yours — you own it completely. Agent-Native Rebuild includes self-optimizing agents that continuously monitor, suggest improvements, and auto-apply safe changes. Risky changes go through your approval queue. Or hand it to your own developers. No lock-in.",
  },
  {
    q: "How is this faster than a traditional agency?",
    a: "Traditional agencies assign 3-5 developers working sequentially. We deploy 12+ AI agents working in parallel — MCP server, frontend, backend, agent tools, tests, and migrations simultaneously. Human engineers supervise edge cases.",
  },
  {
    q: "What's the minimum budget?",
    a: "Agent-Native Rebuild starts at $4,999 setup + $999/mo for managed operations. Traditional Launch tier starts at $12,000 one-time. Enterprise systems with dedicated agent fleets are custom-quoted.",
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
