'use client';

import { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Input } from '@/components/ui/input';
import { getFinancialAdvice } from '@/lib/services/chatbot';
import { Send, Sparkles, X, Bot, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const suggestions = ['How can I save more?', 'Analyze my spending', 'Budget tips'];

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const { chatMessages, addChatMessage, financialSummary, user } = useFinance();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading, open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput('');
    addChatMessage({ role: 'user', content: text.trim() });
    setIsLoading(true);
    try {
      const response = await getFinancialAdvice({
        message: text.trim(),
        financialData: financialSummary,
        userName: user?.name,
      });
      addChatMessage({ role: 'assistant', content: response.message });
    } catch {
      addChatMessage({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed z-[60] flex items-center justify-center w-14 h-14 rounded-full shadow-2xl shadow-primary/30 transition-all duration-300',
          'bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground',
          'hover:scale-110 active:scale-95',
          /* Position: above bottom nav on mobile, bottom-right on desktop */
          'bottom-[calc(80px+env(safe-area-inset-bottom,0px))] right-4 md:bottom-6 md:right-6'
        )}
        aria-label="Open AI Advisor"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <Sparkles className="w-6 h-6" />
        )}
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          'fixed z-[59] flex flex-col transition-all duration-300 origin-bottom-right',
          'bg-card border border-border/50 shadow-2xl shadow-black/20 dark:shadow-black/60 rounded-2xl overflow-hidden',
          /* Mobile: full-width panel sitting above bottom nav */
          'left-3 right-3 bottom-[calc(80px+env(safe-area-inset-bottom,0px))] max-h-[60vh]',
          /* Desktop: fixed-size panel above button */
          'md:left-auto md:right-6 md:bottom-24 md:w-[380px] md:max-h-[520px]',
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/10 to-emerald-700/5 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">FinSense AI</p>
            <p className="text-[10px] text-muted-foreground leading-none">Your financial advisor</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
          {chatMessages.length === 0 && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs font-semibold text-foreground">Hi {user?.name?.split(' ')[0] ?? 'there'}!</p>
              <p className="text-[11px] text-muted-foreground mt-1">Ask me anything about your finances.</p>
              <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatMessages.map((msg, i) => (
            <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                msg.role === 'user' ? 'bg-primary' : 'bg-foreground'
              )}>
                {msg.role === 'user'
                  ? <User className="w-3 h-3 text-primary-foreground" />
                  : <Bot className="w-3 h-3 text-background" />
                }
              </div>
              <div className={cn(
                'max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-muted text-foreground rounded-tl-sm'
              )}>
                {msg.content}
                {msg.timestamp && (
                  <p className={cn('text-[9px] mt-1 opacity-60', msg.role === 'user' ? 'text-right' : 'text-left')}>
                    {format(new Date(msg.timestamp), 'h:mm a')}
                  </p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center shrink-0">
                <Bot className="w-3 h-3 text-background" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-border/50 shrink-0">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask FinSense AI…"
            className="flex-1 text-xs h-9 rounded-xl bg-muted border-0"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
          >
            <Send className="w-3.5 h-3.5 text-primary-foreground" />
          </button>
        </form>
      </div>
    </>
  );
}
