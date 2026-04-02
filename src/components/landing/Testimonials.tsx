import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Super SaaS delivered our multi-branch ERP in 6 weeks. We were quoted 18 months by a traditional agency. The system is flawless.",
    name: "Budi Santoso",
    role: "Operations Director",
    company: "Retail Nusantara",
  },
  {
    quote: "We eliminated $14k in annual SaaS fees by having them build our custom POS. It works offline, which is critical for our outlets.",
    name: "Sarah Miller",
    role: "Founder",
    company: "Brew & Co.",
  },
  {
    quote: "The AI-assisted architecture process blew my mind. They understood our complex logistics workflow better than we did.",
    name: "David Lin",
    role: "CEO",
    company: "LogiTech Solutions",
  },
];

export function Testimonials() {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((p) => (p + 1) % testimonials.length);
  const prev = () => setIdx((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="section-padding bg-card/40">
      <div className="container-narrow relative z-10">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Client Stories</h2>
          <p className="text-lg text-muted-foreground">Don't just take our word for it.</p>
        </div>

        <div className="glass-card p-8 md:p-12 rounded-3xl relative">
          <Quote className="absolute top-8 left-8 text-primary/10 w-20 h-20" />

          <div className="relative z-10 min-h-[200px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8 text-secondary-foreground">
                  "{testimonials[idx].quote}"
                </p>
                <div>
                  <div className="font-bold text-foreground">{testimonials[idx].name}</div>
                  <div className="text-primary text-sm">
                    {testimonials[idx].role}, {testimonials[idx].company}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === idx ? "bg-primary w-8" : "bg-muted-foreground/30"}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={prev} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={next} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
