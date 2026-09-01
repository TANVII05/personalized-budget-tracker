export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Bills'
  | 'Entertainment'
  | 'Shopping'
  | 'Health'
  | 'Education'
  | 'Others';

export type EmotionalRating = 'loved' | 'neutral' | 'regret' | 'unrated';

export type UserProfileType = 'student' | 'professional';

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory | string;
  createdAt: number; // Timestamp
  dateStr?: string; // YYYY-MM-DD
  notes?: string;
  emotionalRating?: EmotionalRating;
  isSubscription?: boolean;
};

export type WishlistItem = {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory | string;
  createdAt: number;
  coolDownHours: number; // e.g. 24, 48, 72
  status: 'locked' | 'unlocked' | 'bought' | 'cancelled';
  notes?: string;
};

export type SubscriptionItem = {
  id: string;
  title: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  category: ExpenseCategory | string;
  active: boolean;
  notes?: string;
};

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
};

export type UserSettings = {
  monthlyBudget: number; // Monthly Pocket Money / Salary
  hourlyWage: number; // For professionals
  profileType: UserProfileType; // 'student' | 'professional'
  geminiApiKey?: string;
  streakDays: number;
  lastLoggedDate?: string; // YYYY-MM-DD
  unlockedBadges: string[]; // List of badge IDs
  currencySymbol: string;
};
