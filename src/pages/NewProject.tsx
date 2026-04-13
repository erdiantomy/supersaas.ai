import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { NegotiationChat } from "@/components/dashboard/NegotiationChat";
import { useAuth } from "@/hooks/useAuth";
import { useAgentChat } from "@/hooks/useAgentChat";
import { useWorkflowOrchestra, WorkflowStatus } from "@/hooks/useWorkflowOrchestra";
import { Bot, Send, Sparkles, ArrowRight, CheckCircle2, Loader2, Zap, Brain, Calculator, HandshakeIcon, CreditCard, Code, TestTube, Rocket, Activity, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

const WIZARD_STEPS = [
  { agent: "planner", label: "Discovery", description: "Tell us your business problem", icon: Brain, status: "planning" as WorkflowStatus },
  { agent: "architect", label: "Architecture", description: "AI designs agent-native solution", icon: Code, status: "architecting" as WorkflowStatus },
  { agent: "validator", label: "Validation", description: "Agent-native compliance check", icon: ShieldCheck, status: "validating" as WorkflowStatus },
  { agent: "negotiator", label: "Proposal", description: "Review scope & pricing", icon: Calculator, status: "quoting" as WorkflowStatus },
];

const PIPELINE_STAGES: { status: WorkflowStatus; label: string; icon: any }[] = [
  { status: "intake", label: "Intake", icon: Sparkles },
  { status: "planning", label: "Planning", icon: Brain },
  { status: "architecting", label: "Architecture", icon: Code },
  { status: "validating", label: "Validation", icon: ShieldCheck },
  { status: "quoting", label: "Quoting", icon: Calculator },
  { status: "negotiating", label: "Negotiation", icon: HandshakeIcon },
  { status: "paid", label: "Payment", icon: CreditCard },
  { status: "building", label: "Building", icon: Zap },
  { status: "testing", label: "Testing", icon: TestTube },
  { status: "deploying", label: "Deploying", icon: Rocket },
  { status: "live", label: "Live", icon: Activity },
];

const STATUS_ORDER = PIPELINE_STAGES.map(s => s.status);

export default function NewProject() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [showPipeline, setShowPipeline] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const currentAgent = WIZARD_STEPS[step].agent;
  const { messages, isLoading, send, reset } = useAgentChat(currentAgent);
  const { workflow, isProcessing, startWorkflow, advanceWorkflow, sendNegotiationMessage } = useWorkflowOrchestra();

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input, undefined, user?.id);

    // Auto-start orchestration on first message
    if (step === 0 && messages.length === 0 && user?.id) {
      startWorkflow(input, user.id).catch(console.error);
    }

    setInput("");
  };

  const handleNextStep = async () => {
    if (step < WIZARD_STEPS.length - 1) {
      const lastAssistantMsg = messages.filter((m) => m.role === "assistant").pop()?.content || "";
      setStep(step + 1);
      reset();

      // Advance the orchestration pipeline
      if (workflow?.id) {
        advanceWorkflow().catch(console.error);
      }

      setTimeout(() => {
        send(
          `Based on the previous analysis:\n\n${lastAssistantMsg.slice(0, 2000)}\n\nPlease proceed with your analysis.`,
          undefined,
          user?.id
        );
      }, 300);
    } else {
      // Final step — show pipeline view and advance to negotiating
      setShowPipeline(true);
      if (workflow?.id) advanceWorkflow().catch(console.error);
    }
  };

  const handleNegotiationMessage = useCallback(async (message: string) => {
    if (!workflow?.id) return;
    await sendNegotiationMessage(message);
  }, [workflow?.id, sendNegotiationMessage]);

  const handleAdvanceAfterDeal = useCallback(async () => {
    if (!workflow?.id) return;
    await advanceWorkflow();
  }, [workflow?.id, advanceWorkflow]);

  const currentStatusIdx = workflow ? STATUS_ORDER.indexOf(workflow.current_status) : -1;
  const isNegotiating = workflow?.current_status === "negotiating";
  const dealAgreed = workflow?.current_status === "paid" && !!workflow?.final_agreed_quote;

  if (showPipeline && workflow) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="text-2xl font-display font-bold">Orchestration Pipeline</h1>
          <p className="text-muted-foreground text-sm">Your project is being processed by the AI Agent Orchestra</p>

          {/* Pipeline visualization */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PIPELINE_STAGES.map((stage, i) => {
              const isActive = workflow.current_status === stage.status;
              const isDone = currentStatusIdx > i;
              return (
                <motion.div
                  key={stage.status}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`glass-card transition-all ${isActive ? "ring-2 ring-primary" : ""} ${isDone ? "opacity-60" : ""}`}>
                    <CardContent className="p-3 text-center">
                      <stage.icon size={20} className={`mx-auto mb-1 ${isActive ? "text-primary animate-pulse" : isDone ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="text-xs font-medium">{stage.label}</div>
                      {isDone && <CheckCircle2 size={12} className="text-primary mx-auto mt-1" />}
                      {isActive && <Loader2 size={12} className="animate-spin text-primary mx-auto mt-1" />}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Negotiation Chat UI — shown during negotiating phase */}
          {(isNegotiating || dealAgreed) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <NegotiationChat
                negotiationHistory={workflow.negotiation_history || []}
                quoteData={workflow.quote_data}
                isProcessing={isProcessing}
                dealAgreed={dealAgreed}
                onSendMessage={handleNegotiationMessage}
                onAdvancePipeline={handleAdvanceAfterDeal}
              />
            </motion.div>
          )}

          {/* Output cards — shown when NOT negotiating */}
          {!isNegotiating && !dealAgreed && (
            <div className="grid md:grid-cols-2 gap-4">
              {workflow.planner_output && (
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-2">
                      <Brain size={14} className="text-primary" /> Planner Output
                    </h3>
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-48">
                      {JSON.stringify(workflow.planner_output, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
              {workflow.architecture_json && (
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-2">
                      <Code size={14} className="text-primary" /> Architecture
                    </h3>
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-48">
                      {JSON.stringify(workflow.architecture_json, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
              {workflow.quote_data && (
                <Card className="glass-card col-span-full">
                  <CardContent className="p-4">
                    <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-2">
                      <Calculator size={14} className="text-primary" /> Quote
                    </h3>
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-48">
                      {JSON.stringify(workflow.quote_data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex gap-4 text-sm flex-wrap">
            <Badge variant="secondary">Timeline: {workflow.metadata?.timeline_days || "—"} days</Badge>
            <Badge variant="secondary">Projected ROI: ${(workflow.metadata?.projected_roi || 0).toLocaleString()}</Badge>
            <Badge variant="secondary">Agent Minutes: {workflow.metadata?.total_agent_minutes || 0}</Badge>
          </div>

          {/* Advance button — only for non-negotiation, non-terminal states */}
          {!isNegotiating && !dealAgreed && !["live", "optimizing", "paused", "shutdown"].includes(workflow.current_status) && (
            <Button onClick={() => advanceWorkflow()} disabled={isProcessing} className="gap-2">
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              Advance Pipeline
            </Button>
          )}
        </div>
      </DashboardLayout>
    );
  }

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

        {/* Orchestration status badge */}
        {workflow && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
            <Badge variant="outline" className="gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Orchestra: {workflow.current_status}
            </Badge>
          </motion.div>
        )}

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
                  The AI Orchestra will analyze, architect, and propose a solution autonomously.
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
            maxLength={5000}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="rounded-xl px-4">
            <Send size={16} />
          </Button>
          {messages.length > 1 && !isLoading && (
            <Button onClick={handleNextStep} variant="outline" className="rounded-xl gap-2">
              {step < WIZARD_STEPS.length - 1 ? (
                <>Next: {WIZARD_STEPS[step + 1].label} <ArrowRight size={14} /></>
              ) : (
                <>Launch Pipeline <Rocket size={14} /></>
              )}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
