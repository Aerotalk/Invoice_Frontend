import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Copy, RefreshCw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAIStore, ChatMessage } from '../../store/aiStore';
import { cn, formatCurrency } from '../../lib/utils';

export const AICopilotDrawer: React.FC = () => {
  const { isOpen, setOpen, messages, addMessage, isTyping, setTyping, clearHistory } = useAIStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const triggerAIResponse = async (userText: string) => {
    setTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1400)); // typing effect delay
    
    const query = userText.toLowerCase();
    let reply = "";

    if (query.includes("reminder") || query.includes("email") || query.includes("follow")) {
        reply = `Here is a drafted overdue follow-up email for your client:\n\n` +
          `**Subject:** Urgent: Invoice is Overdue\n\n` +
          `Dear Client,\n\n` +
          `I hope you are well. This is a friendly reminder that your invoice was due recently and is currently overdue. \n\n` +
          `Please process payment at your earliest convenience.\n\n` +
          `Let me know if you need any billing adjustments or payment options.\n\n` +
          `Best regards,\n` +
          `InvoiceIQ Admin`;
    } else if (query.includes("revenue") || query.includes("earnings") || query.includes("financial")) {
      reply = `According to your active database:\n\n` +
        `- **Total Revenue Received:** Available in Dashboard\n` +
        `- **Pending Outstanding Balance:** View Reports\n`;
    } else if (query.includes("client") || query.includes("who")) {
      reply = `You have multiple clients registered.\n\n` +
        `Navigate to the Clients tab to see who has an outstanding balance.\n\n`;
    } else if (query.includes("tax") || query.includes("advisory")) {
      reply = `**InvoiceIQ Tax Advisory Tip:**\n\n` +
        `1. Track your tax-deductible expense records in the Expenses tab.\n` +
        `2. Remember to upload PDF receipts to justify write-offs.\n` +
        `3. Consult an accountant regarding quarterly VAT reporting schedules.`;
    } else {
      reply = "I understand! I can help you compile metrics, draft invoicing emails, or fetch client billing balances. Try typing **'outstanding balance'** or **'draft overdue email'** to see my live integrations.";
    }

    addMessage({ sender: 'ai', text: reply });
    setTyping(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    addMessage({ sender: 'user', text });
    setInput("");
    triggerAIResponse(text);
  };

  const handleSuggestion = (prompt: string) => {
    addMessage({ sender: 'user', text: prompt });
    triggerAIResponse(prompt);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Trigger toast notification
    alert("Copied AI output to clipboard!");
  };

  const suggestions = [
    "Draft overdue reminder email",
    "Analyze outstanding balance",
    "List my top client profiles",
    "Review tax deduction metrics"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-[2px]"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="w-full max-w-md h-full bg-card border-l relative z-10 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0 bg-slate-50/50 dark:bg-[#0c1221]/80 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Bot className="w-4 h-4 shrink-0 animate-bounce-slow" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">AI Copilot</h3>
                  <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Online & Integrated
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 select-none shrink-0">
                <button
                  onClick={clearHistory}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all active:scale-90"
                  title="Clear chat history"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-slate-50/10 dark:bg-[#0b101c]/10 text-sm">
              {messages.map((msg, idx) => {
                const isAI = msg.sender === 'ai';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex gap-3",
                      isAI ? "justify-start" : "justify-end"
                    )}
                  >
                    {isAI && (
                      <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center border shrink-0">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "relative max-w-[80%] rounded-xl p-3.5 shadow-sm text-[13px] border",
                      isAI 
                        ? "bg-card border-border text-foreground leading-relaxed font-medium whitespace-pre-wrap"
                        : "bg-primary border-primary text-primary-foreground font-semibold leading-relaxed"
                    )}>
                      {msg.text}
                      
                      {isAI && msg.text.includes("Dear") && (
                        <button
                          onClick={() => handleCopy(msg.text)}
                          className="absolute right-2 bottom-2 p-1 bg-muted border text-muted-foreground hover:text-foreground rounded shadow transition-all active:scale-90"
                          title="Copy text content"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {!isAI && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-foreground flex items-center justify-center border shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center border shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-card border rounded-xl p-3 shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Prompt Chips */}
            <div className="px-4 py-3 shrink-0 bg-slate-50/50 dark:bg-[#0c1221]/50 border-t flex flex-wrap gap-1.5 select-none">
              {suggestions.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestion(p)}
                  className="px-2.5 py-1 rounded-full border bg-card text-[11px] font-semibold text-muted-foreground hover:text-indigo-500 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 transition-all select-none active:scale-95 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  {p}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-3 border-t shrink-0 flex items-center gap-2 bg-card">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask AI Copilot..."
                className="flex-1 px-3 py-2 border rounded-lg bg-slate-50/60 dark:bg-[#0b101c]/40 outline-none focus:bg-card focus:border-indigo-500/70 dark:focus:border-indigo-500/50 transition-all text-xs"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all select-none disabled:opacity-40 disabled:pointer-events-none active:scale-95 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
