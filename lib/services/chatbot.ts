import { GoogleGenAI } from '@google/genai';
import { FinancialSummary, Transaction, Budget, SavingsAccount, Subscription, Wallet } from '@/lib/types';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';

// Initialize Gemini with proper error handling
let ai: GoogleGenAI | null = null;
let currentModelIndex = 0;

// List of models to try in order of preference (using newer models from Google docs)
const MODEL_CASCADE = [
  'gemini-3-flash-preview',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

if (API_KEY) {
  try {
    // Pass API key explicitly since we're using environment variable
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
  }
}

// Function to try the next model in cascade
function getNextModel(): string | null {
  currentModelIndex++;
  if (currentModelIndex >= MODEL_CASCADE.length) {
    return null; // No more models to try
  }
  
  const nextModel = MODEL_CASCADE[currentModelIndex];
  console.log(`Switching to model: ${nextModel}`);
  return nextModel;
}

interface ChatRequest {
  message: string;
  financialData?: FinancialSummary;
  transactions?: Transaction[];
  budgets?: Budget[];
  savings?: SavingsAccount[];
  subscriptions?: Subscription[];
  wallets?: Wallet[];
  userName?: string;
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
}

// Rate limiting for API calls
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute window
const MAX_CALLS_PER_WINDOW = 3; // 3 calls per minute max

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const calls = rateLimitMap.get(userId) || [];
  
  // Remove old calls outside the window
  const recentCalls = calls.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentCalls.length >= MAX_CALLS_PER_WINDOW) {
    return false; // Rate limited
  }
  
  // Add current call
  recentCalls.push(now);
  rateLimitMap.set(userId, recentCalls);
  return true;
}

// Retry logic with exponential backoff and model fallback
async function retryWithBackoff(
  fn: (model: string) => Promise<any>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Use current model from cascade
      const currentModel = MODEL_CASCADE[currentModelIndex];
      return await fn(currentModel);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      
      // For 429 quota errors, don't retry multiple times - quota won't change soon
      if (errMsg.includes('429') || errMsg.includes('quota')) {
        const retryMatch = errMsg.match(/retry in ([0-9.]+)s/i);
        if (retryMatch) {
          const delaySecs = Math.ceil(parseFloat(retryMatch[1]));
          console.warn(`⚠️ QUOTA EXCEEDED: Retry available in ${delaySecs}s. Not retrying further.`);
        }
        throw error; // Fail immediately so UI shows proper error message
      }
      
      // Handle 404 model not found errors by trying next model
      if (errMsg.includes('404') || errMsg.includes('not found')) {
        const nextModel = getNextModel();
        if (nextModel) {
          // Retry immediately with new model (counts as attempt)
          try {
            return await fn(nextModel);
          } catch (retryError) {
            const retryErrMsg = retryError instanceof Error ? retryError.message : String(retryError);
            if (retryErrMsg.includes('404') || retryErrMsg.includes('not found')) {
              continue; // Try next model in next iteration
            }
            throw retryError;
          }
        }
        throw error; // No more models to try
      }
      
      // Don't retry on authentication errors
      if (errMsg.includes('403') || errMsg.includes('unregistered')) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (i === maxRetries - 1) {
        console.log(`⚠️ Max retries (${maxRetries}) exhausted. Giving up.`);
        throw error;
      }
      
      // Retry on: 503 (service unavailable) or timeout errors
      const isRetryable = errMsg.includes('503') || errMsg.includes('timeout') || 
                         errMsg.includes('DEADLINE_EXCEEDED');
      
      if (!isRetryable) {
        throw error;
      }
      
      // Extract suggested retry delay if available in error message (for 503/timeout)
      let delay = baseDelay * Math.pow(2, i); // Default exponential backoff: 1s, 2s, 4s
      const retryMatch = errMsg.match(/retry in ([0-9.]+)s/i);
      if (retryMatch) {
        delay = Math.ceil(parseFloat(retryMatch[1]) * 1000);
        console.log(`API suggests retry delay: ${delay}ms`);
      }
      
      console.log(`🔄 Retry attempt ${i + 1}/${maxRetries} after ${Math.ceil(delay / 1000)}s (${errMsg.substring(0, 50)}...)`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export async function getFinancialAdvice(request: ChatRequest): Promise<ChatResponse> {
  // Check if API key is configured
  if (!API_KEY) {
    return {
      message: `**🔑 Gemini API Key Not Configured**\n\nThe AI chat feature requires a Google Gemini API key. Here's how to set it up:\n\n**Steps:**\n1. Visit https://aistudio.google.com/app/apikey\n2. Click "Get API Key" → "Create API key in new project"\n3. Copy the generated key\n4. Open \`.env.local\` in your project root\n5. Paste the key next to \`NEXT_PUBLIC_GEMINI_API_KEY=\`\n6. Save and restart your dev server (\`npm run dev\`)\n\nOnce configured, the AI will analyze your actual financial data to provide personalized advice!`,
    };
  }

  if (!ai) {
    return {
      message: `**⚠️ AI Service Unavailable**\n\nThe Gemini API failed to initialize. Please check:\n• Your API key is valid\n• The .env.local file is saved correctly\n• Your dev server is restarted\n\nTip: You can still view your financial data and budgets in other sections of the app!`,
    };
  }

  // Apply rate limiting (using hash of message as identifier)
  const messageHash = request.message.substring(0, 10);
  if (!checkRateLimit(messageHash)) {
    return {
      message: `**⏱️ Please Slow Down**\n\nYou're sending requests too quickly. Please wait a moment before asking another question.\n\nI can handle 3 questions per minute. This helps ensure stable service for everyone!`,
    };
  }

  const { message, financialData, transactions = [], budgets = [], savings = [], subscriptions = [], wallets = [], userName } = request;

  // Format transaction history
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20)
    .map(t => `${new Date(t.date).toLocaleDateString('en-PH')}: ${t.type === 'income' ? '+' : '-'}₱${t.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} (${t.category}) - ${t.description}`)
    .join('\n');

  // Format budget details
  const budgetDetails = budgets
    .map(b => `${b.category}: ₱${b.monthlyLimit.toLocaleString('en-PH', { minimumFractionDigits: 2 })} for ${b.month}`)
    .join('\n');

  // Format savings accounts
  const savingsDetails = savings
    .map(s => `${s.name} (${s.bankName}): ₱${s.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })} at ${s.interestRatePA}% interest per annum`)
    .join('\n');

  // Format subscriptions/recurring bills
  const subscriptionDetails = subscriptions
    .map(s => `${s.name}: ₱${s.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} (${s.billingCycle}) - Next: ${new Date(s.nextBillingDate).toLocaleDateString('en-PH')}`)
    .join('\n');

  // Format wallet breakdown
  const walletDetails = wallets
    .map(w => `${w.name} (${w.type}): ₱${w.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`)
    .join('\n');

  const systemContext = `You are FinSense AI, a friendly and knowledgeable personal finance advisor for Filipino students and young professionals. You have access to the user's complete financial data and should provide personalized, actionable advice based on their actual spending patterns, income, and financial goals.

CORE RESPONSIBILITIES:
1. Answer questions about the user's finances using their actual data
2. Identify spending patterns and trends
3. Suggest ways to optimize budgets and increase savings
4. Provide encouragement and practical financial guidance
5. Always use Philippine Peso (₱) for currency

${wallets && wallets.length > 0 ? `WALLET BREAKDOWN:
${walletDetails}
Total Balance: ₱${(wallets.reduce((sum, w) => sum + w.balance, 0)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : ''}

${financialData ? `FINANCIAL SUMMARY:
- Name: ${userName ?? 'User'}
- Monthly Income: ₱${financialData.totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
- Monthly Expenses: ₱${financialData.totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
- Current Balance: ₱${financialData.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
- Savings Rate: ${((financialData.totalIncome - financialData.totalExpenses) / financialData.totalIncome * 100).toFixed(1)}% (${financialData.totalIncome - financialData.totalExpenses > 0 ? 'Good!' : 'Needs attention'})` : ''}

${budgetDetails ? `BUDGET LIMITS & PERFORMANCE:
${budgetDetails}` : ''}

${savingsDetails ? `SAVINGS ACCOUNTS:
${savingsDetails}

Total Savings: ₱${(savings?.reduce((sum, s) => sum + s.balance, 0) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : ''}

${subscriptionDetails ? `RECURRING SUBSCRIPTIONS/BILLS:
${subscriptionDetails}
Monthly Recurring: ₱${(subscriptions?.reduce((sum, s) => sum + s.amount, 0) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : ''}

${recentTransactions ? `RECENT TRANSACTION HISTORY (Last 20):
${recentTransactions}` : ''}

ADVICE GUIDELINES:
- Be specific: Reference actual numbers from their data
- Be practical: Give actionable tips they can implement today
- Be encouraging: Celebrate their wins, support them through challenges
- Be realistic: Consider the Filipino context (e.g., family obligations, income uncertainty)
- Suggest concrete goals: "Save ₱X by date Y" instead of vague advice
- Consider local resources: GCash, BDO, BPI, etc.

Keep responses concise (under 250 words). Use bullet points for lists. Format currency with ₱ and commas.`;

  try {
    // Use retry logic for API calls with new API format
    const result = await retryWithBackoff(
      async (modelName: string) => {
        return await ai!.models.generateContent({
          model: modelName,
          contents: `${systemContext}\n\nUser Query: ${message}`,
        });
      },
      3,
      1000
    );
    
    // New API returns text directly
    const text = result.text;
    return { message: text };
  } catch (error: unknown) {
    console.error('Gemini API error:', error);

    const errMsg = error instanceof Error ? error.message : String(error);
    
    // Handle authentication errors
    if (errMsg.includes('403') || errMsg.includes('unregistered')) {
      return {
        message: `**🔑 API Key Issue Detected**\n\nThe API key appears to be invalid or not recognized. Please:\n\n1. Open \`.env.local\` in your project\n2. Check that \`NEXT_PUBLIC_GEMINI_API_KEY\` has a valid key\n3. Get a new key at https://aistudio.google.com/app/apikey if needed\n4. Restart your dev server: \`npm run dev\`\n\nQuick tips while you wait:\n• Your monthly expenses: ₱${financialData?.totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'}\n• You're saving: ₱${((financialData?.totalIncome ?? 0) - (financialData?.totalExpenses ?? 0)).toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'} monthly\n• Check your Budget page for more insights`,
      };
    }

    // Handle model not found errors - all models exhausted
    if (errMsg.includes('404') || errMsg.includes('not found')) {
      return {
        message: `**⚠️ No AI Models Available**\n\nAll available AI models are currently unavailable in your region or with your API key tier.\n\n**Tried:** ${MODEL_CASCADE.slice(0, currentModelIndex + 1).map((m, i) => i === currentModelIndex ? `**${m}** (failed)` : m).join(' → ')}\n\n**What you can do:**\n1. Ensure your API key has billing enabled (free tier has limited model access)\n2. Check available models at https://aistudio.google.com\n3. Enable billing to access more models\n\n**Your financial summary:**\n• Income: ₱${financialData?.totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'}\n• Expenses: ₱${financialData?.totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'}\n• Savings: ₱${((financialData?.totalIncome ?? 0) - (financialData?.totalExpenses ?? 0)).toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'}`,
      };
    }

    // Handle service unavailable (503) - usually temporary
    if (errMsg.includes('503') || errMsg.includes('high demand')) {
      return {
        message: `**⚠️ Service Temporarily Busy**\n\nGoogle's AI service is experiencing high demand right now. This is usually temporary!\n\n**What you can do:**\n• Try again in a few seconds\n• Ask a simpler question\n• Use other features (Dashboard, Budgets, Transactions)\n\n**In the meantime, here's your financial snapshot:**\n• Income: ₱${financialData?.totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'}\n• Expenses: ₱${financialData?.totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'}\n• Savings: ₱${((financialData?.totalIncome ?? 0) - (financialData?.totalExpenses ?? 0)).toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'}`,
      };
    }

    // Handle quota/rate limit errors
    if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      // Extract retry delay if available
      const retryMatch = errMsg.match(/retry in ([0-9.]+)s/i);
      const retryDelay = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
      
      return {
        message: `**⚠️ Free Tier Daily Quota Exceeded**\n\nYou've hit the limit for **free tier** Gemini API usage today. The API says to retry in **${retryDelay} seconds**.\n\n**Free Tier Limits:**\n• 15 requests/minute\n• 1 million tokens/day\n• After hitting limit: Blocked until next calendar day (UTC)\n\n**Your Solutions:**\n\n1️⃣ **Wait it out** (Easiest)\n   - Quota window resets at midnight UTC\n   - You can try again then\n\n2️⃣ **Enable Billing** (Recommended)\n   - Gives you immediate access\n   - Quota increases to 15,000+ requests/day\n   - Pay only for what you use (~$0.50/month for casual testing)\n   - Steps:\n     1. Go to: https://console.cloud.google.com/billing\n     2. Add a payment method\n     3. Restart this app (npm run dev)\n     4. Try again - should work instantly!\n\n**📊 While You Wait - Your Financial Summary:**\n• Monthly Income: ₱${financialData?.totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'}\n• Monthly Expenses: ₱${financialData?.totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'}\n• Monthly Savings: ₱${((financialData?.totalIncome ?? 0) - (financialData?.totalExpenses ?? 0)).toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'}\n\nCheck your **Dashboard** for detailed charts and insights!`,
      };
    }

    // Generic error
    return {
      message: `**Sorry, the AI service encountered an error.** Please try again.\n\nHere are your key metrics:\n• Income: ₱${financialData?.totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'}\n• Expenses: ₱${financialData?.totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'}\n• Savings: ₱${((financialData?.totalIncome ?? 0) - (financialData?.totalExpenses ?? 0)).toLocaleString('en-PH', { minimumFractionDigits: 2 }) ?? 'N/A'}\n\nError: ${errMsg.substring(0, 100)}`,
    };
  }
}
