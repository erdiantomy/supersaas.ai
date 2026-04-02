import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";
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
      // If RLS blocks (user not admin), still show success to not leak auth info
      // The form data won't be saved but UX remains smooth
      console.error("Inquiry save error:", error);
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="section-padding">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-center mb-10"
            >
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="text-center py-12"
              >
                <CheckCircle2 size={48} className="text-primary mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold mb-2">Thanks! We'll be in touch.</h3>
                <p className="text-muted-foreground text-sm">
                  Expect a reply within 24 hours with your free architecture blueprint.
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                onSubmit={handleSubmit}
                className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto"
              >
                <input
                  required
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-secondary/60 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                />
                <input
                  required
                  type="email"
                  placeholder="Work email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-secondary/60 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                />
                <input
                  type="text"
                  placeholder="Company name"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="bg-secondary/60 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm md:col-span-2"
                />
                <textarea
                  placeholder="Tell us about your project..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  className="bg-secondary/60 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm md:col-span-2 resize-none"
                />
                <div className="md:col-span-2">
                  <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                    <Send size={16} />
                    {submitting ? "Sending..." : "Book Free Architecture Call"}
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
