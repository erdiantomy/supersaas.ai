export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-display font-bold text-lg">
            Super<span className="text-primary">SaaS</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>

          <div className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Super SaaS. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
