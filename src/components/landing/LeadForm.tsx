import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("inquiries").insert({
      name: form.name,
      email: form.email,
      company: form.company || null,
      message: form.message || null,
    } as any);

    if (error) {
      console.error("Inquiry save error:", error);
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="section-padding relative overflow-hidden">
      {/* Cinematic ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(152_100%_45%/_0.06),transparent_50%)]" />

      <div className="container-narrow relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden"
        >
          {/* Glow orb behind form */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[150px]"
          />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-10"
            >
              <span className="reveal-line" />
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Let's Build Something{" "}
                <span className="text-gradient-green">Extraordinary</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Book a free 30-minute architecture call. We'll map out your system
                and give you a fixed-price quote within 48 hours.
              </p>
            </motion.div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <CheckCircle2 size={48} className="text-primary mx-auto mb-4 glow-icon" />
                </motion.div>
                <h3 className="text-xl font-display font-bold mb-2">Thanks! We'll be in touch.</h3>
                <p className="text-muted-foreground text-sm">
                  Expect a reply within 24 hours with your free architecture blueprint.
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onSubmit={handleSubmit}
                className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto"
              >
                <input
                  required
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-secondary/60 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 text-sm"
                />
                <input
                  required
                  type="email"
                  placeholder="Work email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-secondary/60 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 text-sm"
                />
                <input
                  type="text"
                  placeholder="Company name"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="bg-secondary/60 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 text-sm md:col-span-2"
                />
                <textarea
                  placeholder="Tell us about your project..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  className="bg-secondary/60 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 text-sm md:col-span-2 resize-none"
                />
                <div className="md:col-span-2">
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.03, boxShadow: "0 0 50px hsl(152 100% 45% / 0.3)" }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    {submitting ? "Sending..." : "Book Free Architecture Call"}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
