import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAgentChat } from "@/hooks/useAgentChat";
import { Bot, Send, Sparkles, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

const WIZARD_STEPS = [
  { agent: "planner", label: "Discovery", description: "Tell us your business problem" },
  { agent: "architect", label: "Architecture", description: "AI designs your solution" },
  { agent: "negotiator", label: "Proposal", description: "Review scope & pricing" },
];

export default function NewProject() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  const currentAgent = WIZARD_STEPS[step].agent;
  const { messages, isLoading, send, reset } = useAgentChat(currentAgent);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input, undefined, user?.id);
    setInput("");
  };

  const handleNextStep = () => {
    if (step < WIZARD_STEPS.length - 1) {
      const lastAssistantMsg = messages.filter((m) => m.role === "assistant").pop()?.content || "";
      setStep(step + 1);
      reset();
      // Auto-seed next agent with context
      setTimeout(() => {
        send(
          `Based on the previous analysis:\n\n${lastAssistantMsg.slice(0, 2000)}\n\nPlease proceed with your analysis.`,
          undefined,
          user?.id
        );
      }, 300);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Progress stepper */}
        <div className="flex items-center gap-2 mb-8">
          {WIZARD_STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: i === step ? 1.1 : 1,
                  backgroundColor: i <= step ? "hsl(var(--primary))" : "hsl(var(--muted))",
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              >
                {i < step ? (
                  <CheckCircle2 size={16} className="text-primary-foreground" />
                ) : (
                  <span className={i <= step ? "text-primary-foreground" : "text-muted-foreground"}>{i + 1}</span>
                )}
              </motion.div>
              <div className="hidden sm:block">
                <div className={`text-xs font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </div>
              </div>
              {i < WIZARD_STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Agent header */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 rounded-xl mb-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot size={20} className="text-primary" />
          </div>
          <div>
            <div className="font-display font-bold text-sm flex items-center gap-2">
              {WIZARD_STEPS[step].label} Agent
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="text-xs text-muted-foreground">{WIZARD_STEPS[step].description}</div>
          </div>
        </motion.div>

        {/* Chat area */}
        <div ref={chatRef} className="glass-card rounded-xl p-4 h-[400px] overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 && step === 0 && (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <Sparkles size={32} className="text-primary mx-auto mb-3" />
                <h3 className="font-display font-bold text-lg mb-1">Describe Your Business Problem</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Tell our Discovery Agent about your business challenge in plain English. 
                  Be as detailed as you like — the AI will analyze and propose a solution.
                </p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/80 text-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-secondary/80 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Agent thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={step === 0 ? "Describe your business problem..." : "Ask a follow-up question..."}
            className="flex-1 bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="rounded-xl px-4">
            <Send size={16} />
          </Button>
          {messages.length > 1 && !isLoading && step < WIZARD_STEPS.length - 1 && (
            <Button onClick={handleNextStep} variant="outline" className="rounded-xl gap-2">
              Next: {WIZARD_STEPS[step + 1].label} <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
