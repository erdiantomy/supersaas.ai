import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import testimonialBudi from "@/assets/testimonial-budi.jpg";
import testimonialSarah from "@/assets/testimonial-sarah.jpg";
import testimonialDavid from "@/assets/testimonial-david.jpg";
import logoRetail from "@/assets/logo-retail-nusantara.png";
import logoBrew from "@/assets/logo-brew-co.png";
import logoLogitech from "@/assets/logo-logitech-solutions.png";

const testimonials = [
  {
    quote: "Super SaaS delivered our multi-branch ERP in 6 weeks. We were quoted 18 months by a traditional agency. The system is flawless.",
    name: "Budi Santoso",
    role: "Operations Director",
    company: "Retail Nusantara",
    photo: testimonialBudi,
    logo: logoRetail,
    rating: 5,
    metric: "6 weeks delivery",
  },
  {
    quote: "We eliminated $14k in annual SaaS fees by having them build our custom POS. It works offline, which is critical for our outlets.",
    name: "Sarah Miller",
    role: "Founder",
    company: "Brew & Co.",
    photo: testimonialSarah,
    logo: logoBrew,
    rating: 5,
    metric: "$14k/yr saved",
  },
  {
    quote: "The AI-assisted architecture process blew my mind. They understood our complex logistics workflow better than we did.",
    name: "David Lin",
    role: "CEO",
    company: "LogiTech Solutions",
    photo: testimonialDavid,
    logo: logoLogitech,
    rating: 5,
    metric: "3x faster launch",
  },
];

export function Testimonials() {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((p) => (p + 1) % testimonials.length);
  const prev = () => setIdx((p) => (p - 1 + testimonials.length) % testimonials.length);
  const t = testimonials[idx];

  return (
    <section className="section-padding bg-card/40">
      <div className="container-narrow relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Client Stories</h2>
          <p className="text-lg text-muted-foreground">Don't just take our word for it.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="glass-card p-8 md:p-12 rounded-3xl relative"
        >
          <Quote className="absolute top-8 left-8 text-primary/10 w-20 h-20" />

          <div className="relative z-10 min-h-[280px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Rating stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={18} className="fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8 text-secondary-foreground">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <img
                    src={t.photo}
                    alt={t.name}
                    loading="lazy"
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                  />

                  <div className="flex-1">
                    <div className="font-bold text-foreground">{t.name}</div>
                    <div className="text-primary text-sm">
                      {t.role}, {t.company}
                    </div>
                  </div>

                  {/* Company logo */}
                  <img
                    src={t.logo}
                    alt={t.company}
                    loading="lazy"
                    width={80}
                    height={80}
                    className="hidden sm:block w-16 h-16 md:w-20 md:h-20 object-contain rounded-lg bg-white/10 p-2"
                  />
                </div>

                {/* Metric badge */}
                <div className="mt-6">
                  <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    ✓ {t.metric}
                  </span>
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
        </motion.div>

        {/* Client logos strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Trusted by innovative companies</p>
          <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <img
                  src={t.logo}
                  alt={t.company}
                  loading="lazy"
                  width={36}
                  height={36}
                  className="w-9 h-9 object-contain rounded bg-white/10 p-1"
                />
                <span className="text-sm font-medium text-muted-foreground">{t.company}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
