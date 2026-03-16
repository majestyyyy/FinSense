'use client';

import { ChatBot } from '@/components/ChatBot';

export default function AdvisorPage() {
  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)] flex flex-col p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">AI Advisor</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Personalized financial advice based on your data
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatBot />
      </div>
    </div>
  );
}
