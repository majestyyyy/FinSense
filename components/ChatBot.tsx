'use client';

import { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getFinancialAdvice } from '@/lib/services/chatbot';
import { Send, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export const cleanMarkdown = (text: string): React.ReactNode => {
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    if (!line.trim()) {
      return <div key={lineIdx}>&nbsp;</div>;
    }

    // Process inline formatting in each line
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partKey = 0;

    // Split by bold (**text**), italic (*text*), and code (`text`)
    const formatRegex = /\*\*([^*]+)\*\*|(?<!\*)\*([^*]+)\*(?!\*)|`([^`]+)`/g;
    let lastIndex = 0;
    let match;

    while ((match = formatRegex.exec(line)) !== null) {
      // Add text before formatting
      if (match.index > lastIndex) {
        const textBefore = line.slice(lastIndex, match.index);
        parts.push(
          <span key={`text-${partKey++}`}>{textBefore}</span>
        );
      }

      // Add formatted content
      if (match[1]) {
        // Bold text
        parts.push(
          <strong key={`bold-${partKey++}`} className="font-semibold">
            {match[1]}
          </strong>
        );
      } else if (match[2]) {
        // Italic text
        parts.push(
          <em key={`italic-${partKey++}`} className="italic">
            {match[2]}
          </em>
        );
      } else if (match[3]) {
        // Inline code
        parts.push(
          <code
            key={`code-${partKey++}`}
            className="bg-muted/70 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono"
          >
            {match[3]}
          </code>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < line.length) {
      parts.push(
        <span key={`text-${partKey++}`}>{line.slice(lastIndex)}</span>
      );
    }

    return (
      <div key={lineIdx} className="whitespace-pre-wrap break-words">
        {parts.length > 0 ? parts : line}
      </div>
    );
  });
};

const suggestions = [
  'How can I save more money?',
  'Analyze my spending patterns',
  'What are my biggest expenses?',
  'Budget tips for students',
  'When should I increase my savings?',
  'How do I optimize my wallets?'
];



export function ChatBot() {
  const { chatMessages, addChatMessage, financialSummary, user, transactions, budgets, savingsAccounts, subscriptions, wallets } = useFinance();
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
        transactions,
        budgets,
        savings: savingsAccounts,
        subscriptions,
        wallets,
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
    <div className="flex flex-col h-full w-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pb-4 sm:pb-6 pr-1">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 sm:space-y-5 px-3 sm:px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base sm:text-lg">Financial AI Advisor</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
                Ask me anything about your spending, budgets, or financial goals
              </p>
            </div>
            <div className="w-full max-w-xs space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestedQuestion(s)}
                  className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm bg-muted hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 transition-all"
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
              className={`flex items-end gap-2 sm:gap-2.5 px-2 sm:px-0 animate-fade-up ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {message.role === 'user' ? (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white shrink-0 mb-1">
                  {userInitials}
                </div>
              ) : (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 mb-1">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground" />
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[82%] sm:max-w-[75%] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border text-foreground rounded-bl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{cleanMarkdown(message.content)}</div>
                <p className={`text-[9px] sm:text-[10px] mt-2 ${
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
          <div className="flex items-end gap-2 sm:gap-2.5 px-2 sm:px-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 mb-1">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="typing-dot w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-muted-foreground inline-block" />
                <span className="typing-dot w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-muted-foreground inline-block" />
                <span className="typing-dot w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-muted-foreground inline-block" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="space-y-2 pt-3 sm:pt-3 border-t border-border px-2 sm:px-0 pb-2 bg-card/50">
        {/* Quick suggestions */}
        {chatMessages.length > 0 && !isLoading && (
          <div className="flex gap-1 sm:gap-1.5 flex-wrap">
            {suggestions.slice(0, 2).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestedQuestion(s)}
                className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-muted rounded-full hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-1.5 sm:gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your finances…"
            disabled={isLoading}
            className="flex-1 rounded-xl text-xs sm:text-sm h-9 sm:h-10"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-sm shrink-0 w-9 h-9 sm:w-10 sm:h-10"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
