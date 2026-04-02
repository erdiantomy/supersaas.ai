import { ArrowRight } from "lucide-react";

export function Problem() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-narrow text-center">
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-8 leading-tight">
          You're paying{" "}
          <span className="text-destructive">$2,000/month</span> for software
          that forces you to change how you work.
        </h2>

        <p className="text-lg text-muted-foreground mb-14 leading-relaxed max-w-3xl mx-auto">
          Generic SaaS tools are built for the "average" business. So you end up
          with spreadsheets, manual data entry, and a system that slows your
          team down instead of speeding them up.
        </p>

        <div className="glass-card p-8 md:p-10 rounded-2xl border-destructive/20 relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
            The SaaS Trap
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14">
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Year 1</div>
              <div className="text-3xl font-mono font-bold text-secondary-foreground">$24,000</div>
            </div>
            <ArrowRight className="text-destructive rotate-90 md:rotate-0" size={24} />
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Year 3</div>
              <div className="text-3xl font-mono font-bold text-secondary-foreground">$72,000</div>
            </div>
            <ArrowRight className="text-destructive rotate-90 md:rotate-0" size={24} />
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">You Own</div>
              <div className="text-3xl font-display font-bold text-destructive">Nothing</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
