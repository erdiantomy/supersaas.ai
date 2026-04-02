import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="section-padding">
      <div className="container-narrow">
        <div className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden">
          {/* Glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Let's Build Something{" "}
                <span className="text-gradient-green">Extraordinary</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Book a free 30-minute architecture call. We'll map out your system
                and give you a fixed-price quote within 48 hours.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle2 size={48} className="text-primary mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold mb-2">Thanks! We'll be in touch.</h3>
                <p className="text-muted-foreground text-sm">
                  Expect a reply within 24 hours with your free architecture blueprint.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
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
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                    <Send size={16} />
                    Book Free Architecture Call
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
