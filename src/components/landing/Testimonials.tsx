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
    quote: "Super SaaS deployed 12 AI agents that built our multi-branch ERP in 6 weeks. We were quoted 18 months by a traditional agency. The system handles 47 locations flawlessly.",
    name: "Budi Santoso",
    role: "Operations Director",
    company: "Retail Nusantara",
    industry: "Retail · 47 locations · 2,400 employees",
    photo: testimonialBudi,
    logo: logoRetail,
    rating: 5,
    metric: "6 weeks · $340K saved annually",
  },
  {
    quote: "The agent swarm eliminated $14k in annual SaaS fees by building our custom POS. It works offline — which is critical. But what amazed me was the 523 automated tests they shipped with it.",
    name: "Sarah Miller",
    role: "Founder",
    company: "Brew & Co.",
    industry: "F&B · 12 outlets · Indonesia",
    photo: testimonialSarah,
    logo: logoBrew,
    rating: 5,
    metric: "$14k/yr saved · 5-week delivery",
  },
  {
    quote: "Their Discovery Agent understood our logistics complexity better than we did. Within 48 hours we had a complete architecture blueprint. 4 months later — $40K MRR.",
    name: "David Lin",
    role: "CEO",
    company: "LogiTech Solutions",
    industry: "Logistics SaaS · 5 countries · 200+ clients",
    photo: testimonialDavid,
    logo: logoLogitech,
    rating: 5,
    metric: "$40K MRR in 4 months",
  },
];

export function Testimonials() {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((p) => (p + 1) % testimonials.length);
  const prev = () => setIdx((p) => (p - 1 + testimonials.length) % testimonials.length);
  const t = testimonials[idx];

  return (
    <section className="section-padding bg-card/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(152_100%_45%/_0.03),transparent_60%)]" />

      <div className="container-narrow relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <span className="reveal-line" />
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Client Stories</h2>
          <p className="text-lg text-muted-foreground">Real results from real businesses powered by our agent fleet.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-8 md:p-12 rounded-3xl relative"
        >
          <Quote className="absolute top-8 left-8 text-primary/10 w-20 h-20" />

          <div className="relative z-10 min-h-[320px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 40, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.97 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, rotate: -30 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
                    >
                      <Star size={18} className="fill-primary text-primary glow-icon" />
                    </motion.div>
                  ))}
                </div>

                <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8 text-secondary-foreground">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-4">
                  <motion.img
                    src={t.photo}
                    alt={t.name}
                    loading="lazy"
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  />

                  <div className="flex-1">
                    <div className="font-bold text-foreground">{t.name}</div>
                    <div className="text-primary text-sm">
                      {t.role}, {t.company}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.industry}</div>
                  </div>

                  <img
                    src={t.logo}
                    alt={t.company}
                    loading="lazy"
                    width={80}
                    height={80}
                    className="hidden sm:block w-16 h-16 md:w-20 md:h-20 object-contain rounded-lg bg-white/10 p-2"
                  />
                </div>

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
                  className={`h-2.5 rounded-full transition-all duration-500 ${i === idx ? "bg-primary w-8" : "bg-muted-foreground/30 w-2.5"}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={prev}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft size={18} />
              </motion.button>
              <motion.button
                onClick={next}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 text-center"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Trusted by innovative companies</p>
          <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.12 }}
                whileHover={{ scale: 1.1, opacity: 1 }}
                className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-all duration-500 cursor-pointer"
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
