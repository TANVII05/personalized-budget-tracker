import { ExpenseCategory } from '../types/Expense';

export type ParsedExpenseResult = {
  title: string;
  amount: number;
  category: ExpenseCategory;
  dateStr: string; // YYYY-MM-DD
  confidence: number;
  source: 'gemini' | 'local_nlp';
};

const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  Food: [
    'pizza', 'burger', 'swiggy', 'zomato', 'food', 'dinner', 'lunch', 'breakfast',
    'coffee', 'tea', 'cafe', 'starbucks', 'mcdonalds', 'kfc', 'groceries', 'supermarket',
    'restaurant', 'snack', 'drinks', 'beer', 'bar', 'bistro'
  ],
  Travel: [
    'uber', 'ola', 'rapido', 'cab', 'taxi', 'metro', 'bus', 'train', 'flight',
    'petrol', 'diesel', 'fuel', 'toll', 'parking', 'auto', 'rickshaw', 'ticket'
  ],
  Bills: [
    'rent', 'electricity', 'water', 'wifi', 'internet', 'broadband', 'recharge',
    'bill', 'maintenance', 'gas', 'cylinder', 'maid', 'cook'
  ],
  Entertainment: [
    'netflix', 'prime', 'spotify', 'hotstar', 'movie', 'cinema', 'theatre',
    'concert', 'game', 'playstation', 'steam', 'bowling', 'party'
  ],
  Shopping: [
    'amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'clothes', 'shoes', 'jacket',
    'shopping', 'electronics', 'mall', 'tshirt', 'dress', 'watch'
  ],
  Health: [
    'doctor', 'medicine', 'pharmacy', 'hospital', 'clinic', 'gym', 'supplements',
    'protein', 'therapy', 'dentist', 'apollo'
  ],
  Education: [
    'udemy', 'coursera', 'course', 'books', 'book', 'tuition', 'college',
    'school', 'exam', 'fees', 'stationary'
  ],
  Others: []
};

/**
 * Fast offline NLP fallback parser using regex and keyword entity extraction
 */
export function parseLocalNLP(input: string): ParsedExpenseResult {
  const text = input.trim();
  const lower = text.toLowerCase();

  // 1. Extract Amount (e.g. ₹500, Rs. 500, 500rs, $45, 500)
  let amount = 0;
  const amountRegex = /(?:₹|rs\.?|inr|\$)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rs|rupees|bucks)?/i;
  const amountMatch = lower.match(amountRegex);
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // 2. Extract Date (yesterday, today, days ago)
  const now = new Date();
  let dateObj = new Date();

  if (lower.includes('yesterday')) {
    dateObj.setDate(now.getDate() - 1);
  } else if (lower.includes('day before yesterday')) {
    dateObj.setDate(now.getDate() - 2);
  }

  const dateStr = dateObj.toISOString().split('T')[0];

  // 3. Extract Category
  let matchedCategory: ExpenseCategory = 'Others';
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        matchedCategory = category as ExpenseCategory;
        break;
      }
    }
    if (matchedCategory !== 'Others') break;
  }

  // 4. Extract Title / Description clean up
  let cleanedTitle = text
    .replace(/(?:spent|paid|bought|for|on|at|yesterday|today|rs\.?|inr|₹|\$|\d+(?:\.\d+)?)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanedTitle || cleanedTitle.length < 2) {
    cleanedTitle = matchedCategory !== 'Others' ? matchedCategory : 'Expense';
  } else {
    // Capitalize first letter
    cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);
  }

  return {
    title: cleanedTitle,
    amount: amount || 0,
    category: matchedCategory,
    dateStr,
    confidence: 0.8,
    source: 'local_nlp',
  };
}

/**
 * Parses freeform natural language text into a structured Expense using Google Gemini API
 * or falls back to local NLP engine if API key is missing or offline.
 */
export async function parseNaturalLanguageExpense(
  input: string,
  geminiApiKey?: string
): Promise<ParsedExpenseResult> {
  if (!input || !input.trim()) {
    return {
      title: '',
      amount: 0,
      category: 'Others',
      dateStr: new Date().toISOString().split('T')[0],
      confidence: 0,
      source: 'local_nlp',
    };
  }

  // If Gemini API Key is provided, attempt live LLM extraction
  if (geminiApiKey && geminiApiKey.trim().length > 10) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey.trim()}`;
      const prompt = `You are a financial entity extraction assistant. Extract expense details from this user input: "${input}".
Current date is: ${new Date().toISOString().split('T')[0]}.
Category must be one of: ["Food", "Travel", "Bills", "Entertainment", "Shopping", "Health", "Education", "Others"].
Respond with ONLY a valid JSON object in this exact schema without markdown formatting:
{
  "title": "Short title e.g. Pizza at Dominos",
  "amount": 450,
  "category": "Food",
  "dateStr": "YYYY-MM-DD"
}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return {
            title: parsed.title || 'Expense',
            amount: Number(parsed.amount) || 0,
            category: parsed.category || 'Others',
            dateStr: parsed.dateStr || new Date().toISOString().split('T')[0],
            confidence: 0.98,
            source: 'gemini',
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API parse failed, falling back to local NLP:', err);
    }
  }

  // Fallback to high-speed local entity extraction
  return parseLocalNLP(input);
}
