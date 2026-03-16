'use client';

import { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getFinancialAdvice } from '@/lib/services/chatbot';
import { Send, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const suggestions = ['Tell me about budgeting', 'How can I save more?', 'Show my spending'];

export function ChatBot() {
  const { chatMessages, addChatMessage, financialSummary, user } = useFinance();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    addChatMessage({ role: 'user', content: userMessage });
    setIsLoading(true);

    try {
      const response = await getFinancialAdvice({
        message: userMessage,
        financialData: financialSummary,
        userName: user?.name,
      });

      addChatMessage({ role: 'assistant', content: response.message });
    } catch (error) {
      console.error('Error getting financial advice:', error);
      addChatMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 0);
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-auto space-y-4 pb-4 pr-1">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-5 px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Financial AI Advisor</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Ask me anything about your spending, budgets, or financial goals
              </p>
            </div>
            <div className="w-full max-w-xs space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestedQuestion(s)}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm bg-muted hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {message.role === 'user' ? (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white shrink-0 mb-1">
                  {userInitials}
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm shadow-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border text-foreground rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className={`text-[10px] mt-1 ${
                  message.role === 'user' ? 'text-primary-foreground/60 text-right' : 'text-muted-foreground'
                }`}>
                  {format(new Date(message.timestamp), 'HH:mm')}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground inline-block" />
                <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground inline-block" />
                <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground inline-block" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="space-y-2 pt-2 border-t border-border">
        {/* Quick suggestions */}
        {chatMessages.length > 0 && !isLoading && (
          <div className="flex gap-1.5 flex-wrap">
            {suggestions.slice(0, 2).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestedQuestion(s)}
                className="text-xs px-3 py-1.5 bg-muted rounded-full hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your finances…"
            disabled={isLoading}
            className="flex-1 rounded-xl"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
