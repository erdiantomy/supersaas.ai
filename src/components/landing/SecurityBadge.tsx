import { motion } from "framer-motion";
import { Shield, Lock, Globe, Server } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "SOC2 Compliant",
    desc: "Enterprise-grade security standards across our entire pipeline.",
  },
  {
    icon: Lock,
    title: "GDPR Ready",
    desc: "Full data protection compliance for EU operations and beyond.",
  },
  {
    icon: Globe,
    title: "Data Residency",
    desc: "Choose where your data lives — US, EU, or APAC regions.",
  },
  {
    icon: Server,
    title: "On-Premise Option",
    desc: "Deploy to your own infrastructure. Zero external dependencies.",
  },
];

export function SecurityBadge() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(152_100%_45%/_0.02),transparent_60%)]" />

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <span className="reveal-line" />
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Enterprise-Grade Security
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your data, your infrastructure, your rules. We build with security as a first principle.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 40, scale: 0.93 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, scale: 1.03, transition: { duration: 0.3 } }}
              className="glass-card p-6 rounded-2xl text-center group hover:border-primary/20 transition-all duration-500"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors glow-icon"
              >
                <b.icon size={22} />
              </motion.div>
              <h3 className="font-display font-bold text-sm mb-2">{b.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
