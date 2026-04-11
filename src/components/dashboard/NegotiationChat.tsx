import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, HandshakeIcon, CheckCircle2, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

interface NegotiationMessage {
  role: string;
  message: string;
  timestamp: string;
}

interface NegotiationChatProps {
  negotiationHistory: NegotiationMessage[];
  quoteData: any;
  isProcessing: boolean;
  dealAgreed: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onAdvancePipeline: () => void;
}

const QUICK_RESPONSES = [
  { label: "Looks good, let's proceed!", icon: CheckCircle2, message: "This looks great. I'd like to proceed with the recommended plan. Let's do it!" },
  { label: "Can we discuss pricing?", icon: DollarSign, message: "I'm interested but the pricing is a bit higher than my budget. Can we explore options to reduce the cost while keeping the core features?" },
  { label: "Tell me about the Scale tier", icon: ArrowRight, message: "I'm interested in the Scale tier. Can you break down what's included in the managed AI ops and how it benefits my business long-term?" },
  { label: "What about MVP first?", icon: ArrowRight, message: "Can we start with the MVP tier to validate the concept, then upgrade to Scale once we see results? What would that migration path look like?" },
];

export function NegotiationChat({
  negotiationHistory,
  quoteData,
  isProcessing,
  dealAgreed,
  onSendMessage,
  onAdvancePipeline,
}: NegotiationChatProps) {
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [negotiationHistory]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const msg = input.trim();
    setInput("");
    await onSendMessage(msg);
  };

  const handleQuickResponse = async (message: string) => {
    if (isProcessing) return;
    await onSendMessage(message);
  };

  // Extract tier info for the sidebar
  const tiers = quoteData?.tiers || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main chat area */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header */}
        <div className="glass-card p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <HandshakeIcon size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-display font-bold text-sm flex items-center gap-2">
              Negotiation Agent
              {!dealAgreed && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
              {dealAgreed && <Badge className="bg-primary/20 text-primary text-xs">Deal Agreed ✓</Badge>}
            </div>
            <div className="text-xs text-muted-foreground">
              {dealAgreed
                ? "Terms agreed! Ready to proceed to payment."
                : "Discuss scope, pricing, and terms. Counter-offer freely."}
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div
          ref={chatRef}
          className="glass-card rounded-xl p-4 h-[420px] overflow-y-auto space-y-4"
        >
          <AnimatePresence>
            {negotiationHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`flex ${msg.role === "client" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === "client" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    msg.role === "client" ? "bg-primary/20" : "bg-secondary"
                  }`}>
                    {msg.role === "client" ? <User size={14} className="text-primary" /> : <Bot size={14} className="text-primary" />}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "client"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/80 text-foreground"
                    }`}
                  >
                    {msg.role === "agent" ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{msg.message}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.message
                    )}
                    <div className={`text-[10px] mt-1 ${msg.role === "client" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isProcessing && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                  <Bot size={14} className="text-primary" />
                </div>
                <div className="bg-secondary/80 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Negotiation Agent analyzing...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick responses (only if not agreed) */}
        {!dealAgreed && negotiationHistory.length > 0 && !isProcessing && (
          <div className="flex flex-wrap gap-2">
            {QUICK_RESPONSES.map((qr, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="rounded-full text-xs gap-1.5 border-border/50 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => handleQuickResponse(qr.message)}
                disabled={isProcessing}
              >
                <qr.icon size={12} /> {qr.label}
              </Button>
            ))}
          </div>
        )}

        {/* Input area */}
        {!dealAgreed ? (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type your counter-offer or question..."
              className="flex-1 bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
              disabled={isProcessing}
              maxLength={2000}
            />
            <Button
              onClick={handleSend}
              disabled={isProcessing || !input.trim()}
              className="rounded-xl px-4"
            >
              <Send size={16} />
            </Button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Button onClick={onAdvancePipeline} className="w-full gap-2 h-12 text-base">
              <CheckCircle2 size={18} /> Proceed to Payment & Build
            </Button>
          </motion.div>
        )}
      </div>

      {/* Quote sidebar */}
      <div className="space-y-4">
        {tiers.length > 0 ? (
          tiers.map((tier: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`glass-card ${i === 1 ? "ring-2 ring-primary" : ""}`}>
                <CardContent className="p-4">
                  {i === 1 && (
                    <Badge className="bg-primary/20 text-primary text-[10px] mb-2">Recommended</Badge>
                  )}
                  <h4 className="font-display font-bold text-sm">{tier.name}</h4>
                  <div className="text-2xl font-bold text-primary mt-1">
                    ${(tier.price || 0).toLocaleString()}
                  </div>
                  {tier.monthly_managed > 0 && (
                    <div className="text-xs text-muted-foreground">
                      + ${tier.monthly_managed.toLocaleString()}/mo managed
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {tier.timeline_weeks} weeks • {tier.modules_included} modules
                  </div>
                  {tier.features && (
                    <ul className="mt-2 space-y-1">
                      {tier.features.slice(0, 4).map((f: string, fi: number) => (
                        <li key={fi} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <CheckCircle2 size={10} className="text-primary shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                      {tier.features.length > 4 && (
                        <li className="text-xs text-muted-foreground">
                          +{tier.features.length - 4} more
                        </li>
                      )}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <DollarSign size={24} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Quote details will appear here</p>
            </CardContent>
          </Card>
        )}

        {/* ROI projection */}
        {quoteData?.roi_projection && (
          <Card className="glass-card">
            <CardContent className="p-4">
              <h4 className="font-display font-bold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                ROI Projection
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Savings</span>
                  <span className="font-bold text-primary">
                    ${(quoteData.roi_projection.monthly_savings || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payback Period</span>
                  <span className="font-bold">{quoteData.roi_projection.payback_months || "—"} months</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Annual ROI</span>
                  <span className="font-bold text-primary">
                    {quoteData.roi_projection.annual_roi_percent || 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
