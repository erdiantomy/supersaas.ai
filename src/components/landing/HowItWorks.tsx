const steps = [
  { num: "01", title: "Architecture Call", desc: "We map your business logic, identify bottlenecks, and determine if custom software is actually the right move." },
  { num: "02", title: "AI-Assisted Blueprint", desc: "Within 48 hours, you get a complete technical architecture, database schema, and fixed-price quote." },
  { num: "03", title: "Sprint & Review", desc: "We build in 2-week sprints. You test features on a live staging environment as they're completed." },
  { num: "04", title: "Handover & Ownership", desc: "Full source code and IP rights. We deploy to your servers. You own everything." },
];

export function HowItWorks() {
  return (
    <section id="process" className="section-padding">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">How We Work</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A transparent, milestone-driven process designed to eliminate surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-12 right-12 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {steps.map((step) => (
            <div key={step.num} className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto bg-background border border-border rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-display font-bold text-primary">{step.num}</span>
              </div>
              <h3 className="text-lg font-display font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
