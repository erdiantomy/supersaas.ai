import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Problem } from "@/components/landing/Problem";
import { AIAdvantage } from "@/components/landing/AIAdvantage";
import { Services } from "@/components/landing/Services";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { CaseStudies } from "@/components/landing/CaseStudies";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { LeadForm } from "@/components/landing/LeadForm";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-foreground film-grain">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Problem />
        <AIAdvantage />
        <Services />
        <HowItWorks />
        <ComparisonTable />
        <CaseStudies />
        <Testimonials />
        <Pricing />
        <FAQ />
        <LeadForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
