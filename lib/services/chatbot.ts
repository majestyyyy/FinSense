import { GoogleGenerativeAI } from '@google/generative-ai';
import { FinancialSummary } from '@/lib/types';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '');

interface ChatRequest {
  message: string;
  financialData?: FinancialSummary;
  userName?: string;
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
}

export async function getFinancialAdvice(request: ChatRequest): Promise<ChatResponse> {
  const { message, financialData, userName } = request;

  const systemContext = `You are FinSense AI, a friendly and knowledgeable personal finance advisor for Filipino students and young professionals. Always respond in a helpful, concise, and encouraging tone. Use Philippine Peso (₱) for all currency references.

${financialData ? `Here is the user's current financial data:
- Name: ${userName ?? 'User'}
- Total Income: ₱${financialData.totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
- Total Expenses: ₱${financialData.totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
- Current Balance: ₱${financialData.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
- Spending by category: ${JSON.stringify(financialData.categoryBreakdown)}
- Budget status: ${JSON.stringify(financialData.budgetStatus)}` : 'No financial data available yet.'}

Keep responses concise (under 200 words). Use bullet points when listing tips. Be specific to the user's data when available.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent(`${systemContext}\n\nUser: ${message}`);
    const text = result.response.text();

    return { message: text };
  } catch (error: unknown) {
    console.error('Gemini API error:', error);

    // Check for quota/rate limit error
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      return {
        message: `⚠️ **AI quota exceeded.** The Gemini API free-tier limit has been reached for this key.\n\nTo fix this:\n• Go to [Google AI Studio](https://aistudio.google.com) and generate a new API key\n• Or enable billing on your Google Cloud project\n\nIn the meantime, here are quick tips:\n• Save at least 20% of your income\n• Track every transaction, big or small\n• Review your budgets weekly`,
      };
    }

    return {
      message: `Sorry, I couldn't reach the AI service right now. Please try again in a moment.\n\nQuick tips while you wait:\n• Track every expense, no matter how small\n• Aim to save at least 20% of your income\n• Review your budget weekly`,
    };
  }
}
