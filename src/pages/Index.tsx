import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TechPartners } from "@/components/landing/Marquee";
import { Problem } from "@/components/landing/Problem";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AgentStack } from "@/components/landing/AgentStack";
import { Services } from "@/components/landing/Services";
import { ROICalculator } from "@/components/landing/ROICalculator";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { CaseStudies } from "@/components/landing/CaseStudies";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { SecurityBadge } from "@/components/landing/SecurityBadge";
import { FAQ } from "@/components/landing/FAQ";
import { LeadForm } from "@/components/landing/LeadForm";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-foreground film-grain">
      <Navbar />
      <main>
        <Hero />
        <TechPartners />
        <Problem />
        <HowItWorks />
        <AgentStack />
        <Services />
        <ROICalculator />
        <ComparisonTable />
        <CaseStudies />
        <Testimonials />
        <Pricing />
        <SecurityBadge />
        <FAQ />
        <LeadForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
