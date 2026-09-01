import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Expense,
  WishlistItem,
  SubscriptionItem,
  UserSettings,
  Badge,
  EmotionalRating,
} from '../types/Expense';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_log',
    title: 'First Step',
    description: 'Logged your first expense in the app',
    icon: '🌱',
  },
  {
    id: 'streak_3',
    title: 'Habit Builder',
    description: 'Maintained a 3-day logging streak',
    icon: '🔥',
  },
  {
    id: 'streak_7',
    title: 'Consistency King',
    description: 'Logged expenses for 7 consecutive days',
    icon: '👑',
  },
  {
    id: 'impulse_conqueror',
    title: 'Impulse Conqueror',
    description: 'Walked away from an impulse item after cool-down',
    icon: '🛡️',
  },
  {
    id: 'mindful_reviewer',
    title: 'Mindful Spender',
    description: 'Reviewed emotional ROI on 5 past purchases',
    icon: '🧠',
  },
  {
    id: 'sub_slayer',
    title: 'Subscription Slayer',
    description: 'Cleaned up inactive or ghost subscriptions',
    icon: '⚔️',
  },
];

const DEFAULT_SETTINGS: UserSettings = {
  monthlyBudget: 8000, // Default student pocket money
  hourlyWage: 400,
  profileType: 'student', // Default to Student Mode
  streakDays: 1,
  unlockedBadges: ['first_log'],
  currencySymbol: '₹',
};

type ForecastData = {
  projectedMonthEndSpend: number;
  daysPassed: number;
  daysRemaining: number;
  totalDaysInMonth: number;
  dailyBurnRate: number;
  isOverBudget: boolean;
  variancePercentage: number;
};

type ExpenseContextType = {
  expenses: Expense[];
  wishlist: WishlistItem[];
  subscriptions: SubscriptionItem[];
  settings: UserSettings;
  badges: Badge[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  rateExpense: (id: string, rating: EmotionalRating) => void;
  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'status'>) => void;
  resolveWishlistItem: (id: string, action: 'bought' | 'cancelled') => void;
  deleteWishlistItem: (id: string) => void;
  addSubscription: (sub: Omit<SubscriptionItem, 'id' | 'active'>) => void;
  toggleSubscription: (id: string) => void;
  deleteSubscription: (id: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  getDailyAllowance: () => {
    safeToSpendToday: number;
    daysRemaining: number;
    totalSpentThisMonth: number;
    remainingBudget: number;
  };
  getForecast: () => ForecastData;
  getBudgetEquivalency: (amount: number) => string;
  getImpulseSavings: () => number;
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EXPENSES: '@expenses_v2',
  WISHLIST: '@wishlist_v2',
  SUBSCRIPTIONS: '@subscriptions_v2',
  SETTINGS: '@settings_v2',
};

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([
    {
      id: 'sub_1',
      title: 'Netflix / OTT',
      amount: 199,
      billingCycle: 'monthly',
      category: 'Entertainment',
      active: true,
    },
    {
      id: 'sub_2',
      title: 'Spotify Student',
      amount: 59,
      billingCycle: 'monthly',
      category: 'Entertainment',
      active: true,
    },
    {
      id: 'sub_3',
      title: 'College Wifi / Mobile Recharge',
      amount: 299,
      billingCycle: 'monthly',
      category: 'Bills',
      active: true,
    },
  ]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Load persisted state on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [storedExp, storedWish, storedSubs, storedSet] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.EXPENSES),
        AsyncStorage.getItem(STORAGE_KEYS.WISHLIST),
        AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      ]);

      if (storedExp) setExpenses(JSON.parse(storedExp));
      if (storedWish) setWishlist(JSON.parse(storedWish));
      if (storedSubs) setSubscriptions(JSON.parse(storedSubs));
      if (storedSet) {
        const parsed = JSON.parse(storedSet);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (e) {
      console.log('Error loading data from AsyncStorage', e);
    }
  };

  const persistExpenses = async (data: Expense[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data));
    } catch (e) {
      console.log('Failed saving expenses', e);
    }
  };

  const persistWishlist = async (data: WishlistItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(data));
    } catch (e) {
      console.log('Failed saving wishlist', e);
    }
  };

  const persistSubs = async (data: SubscriptionItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(data));
    } catch (e) {
      console.log('Failed saving subscriptions', e);
    }
  };

  const persistSettings = async (data: UserSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
    } catch (e) {
      console.log('Failed saving settings', e);
    }
  };

  const unlockBadge = useCallback((badgeId: string) => {
    setSettings(prev => {
      if (prev.unlockedBadges.includes(badgeId)) return prev;
      const updated = {
        ...prev,
        unlockedBadges: [...prev.unlockedBadges, badgeId],
      };
      persistSettings(updated);
      return updated;
    });
  }, []);

  // Update streak logic
  const updateStreakOnLog = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setSettings(prev => {
      if (prev.lastLoggedDate === todayStr) {
        return prev;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = prev.streakDays;
      if (prev.lastLoggedDate === yesterdayStr) {
        newStreak += 1;
      } else if (!prev.lastLoggedDate) {
        newStreak = 1;
      } else {
        newStreak = 1;
      }

      const updated = {
        ...prev,
        streakDays: newStreak,
        lastLoggedDate: todayStr,
      };

      if (newStreak >= 3) unlockBadge('streak_3');
      if (newStreak >= 7) unlockBadge('streak_7');
      unlockBadge('first_log');

      persistSettings(updated);
      return updated;
    });
  }, [unlockBadge]);

  const addExpense = (item: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...item,
      id: Date.now().toString(),
      createdAt: Date.now(),
      dateStr: item.dateStr || new Date().toISOString().split('T')[0],
      emotionalRating: item.emotionalRating || 'unrated',
    };

    setExpenses(prev => {
      const next = [newExpense, ...prev];
      persistExpenses(next);
      return next;
    });

    updateStreakOnLog();
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => {
      const next = prev.filter(e => e.id !== id);
      persistExpenses(next);
      return next;
    });
  };

  const rateExpense = (id: string, rating: EmotionalRating) => {
    setExpenses(prev => {
      const next = prev.map(e => (e.id === id ? { ...e, emotionalRating: rating } : e));
      persistExpenses(next);

      const ratedCount = next.filter(e => e.emotionalRating && e.emotionalRating !== 'unrated').length;
      if (ratedCount >= 5) {
        unlockBadge('mindful_reviewer');
      }

      return next;
    });
  };

  // Wishlist Actions
  const addWishlistItem = (item: Omit<WishlistItem, 'id' | 'createdAt' | 'status'>) => {
    const newItem: WishlistItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: Date.now(),
      status: 'locked',
    };
    setWishlist(prev => {
      const next = [newItem, ...prev];
      persistWishlist(next);
      return next;
    });
  };

  const resolveWishlistItem = (id: string, action: 'bought' | 'cancelled') => {
    setWishlist(prev => {
      const next = prev.map(w => (w.id === id ? { ...w, status: action } : w));
      persistWishlist(next);
      return next;
    });

    if (action === 'cancelled') {
      unlockBadge('impulse_conqueror');
    } else if (action === 'bought') {
      const item = wishlist.find(w => w.id === id);
      if (item) {
        addExpense({
          title: item.title,
          amount: item.amount,
          category: item.category,
          dateStr: new Date().toISOString().split('T')[0],
          notes: 'Purchased after cool-down reflection',
        });
      }
    }
  };

  const deleteWishlistItem = (id: string) => {
    setWishlist(prev => {
      const next = prev.filter(w => w.id !== id);
      persistWishlist(next);
      return next;
    });
  };

  // Subscriptions Actions
  const addSubscription = (sub: Omit<SubscriptionItem, 'id' | 'active'>) => {
    const newSub: SubscriptionItem = {
      ...sub,
      id: Date.now().toString(),
      active: true,
    };
    setSubscriptions(prev => {
      const next = [...prev, newSub];
      persistSubs(next);
      return next;
    });
  };

  const toggleSubscription = (id: string) => {
    setSubscriptions(prev => {
      const next = prev.map(s => (s.id === id ? { ...s, active: !s.active } : s));
      persistSubs(next);
      unlockBadge('sub_slayer');
      return next;
    });
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(prev => {
      const next = prev.filter(s => s.id !== id);
      persistSubs(next);
      return next;
    });
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...newSettings };
      persistSettings(next);
      return next;
    });
  };

  // 🧠 Safe-to-Spend Daily Allowance Calculation
  const getDailyAllowance = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);

    const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const totalSpentThisMonth = expenses
      .filter(e => (e.dateStr ? e.dateStr.startsWith(currentMonthPrefix) : true))
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const remainingBudget = Math.max(0, settings.monthlyBudget - totalSpentThisMonth);
    const safeToSpendToday = Math.round(remainingBudget / daysRemaining);

    return {
      safeToSpendToday,
      daysRemaining,
      totalSpentThisMonth,
      remainingBudget,
    };
  };

  // 📊 Predictive Month-End Spend Forecast
  const getForecast = (): ForecastData => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysPassed = Math.max(1, now.getDate());
    const daysRemaining = Math.max(0, totalDaysInMonth - daysPassed);

    const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const totalSpentSoFar = expenses
      .filter(e => (e.dateStr ? e.dateStr.startsWith(currentMonthPrefix) : true))
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const dailyBurnRate = totalSpentSoFar / daysPassed;
    const projectedMonthEndSpend = Math.round(dailyBurnRate * totalDaysInMonth);
    const isOverBudget = projectedMonthEndSpend > settings.monthlyBudget;
    const variancePercentage = Math.round(
      ((projectedMonthEndSpend - settings.monthlyBudget) / (settings.monthlyBudget || 1)) * 100
    );

    return {
      projectedMonthEndSpend,
      daysPassed,
      daysRemaining,
      totalDaysInMonth,
      dailyBurnRate: Math.round(dailyBurnRate),
      isOverBudget,
      variancePercentage,
    };
  };

  // 🎓 Smart Equivalency (Student Pocket Money Days vs Professional Work Hours)
  const getBudgetEquivalency = (amount: number): string => {
    if (settings.profileType === 'student') {
      const budget = settings.monthlyBudget > 0 ? settings.monthlyBudget : 8000;
      const pct = Math.round((amount / budget) * 100);
      const dailyStandard = budget / 30;
      const daysOfAllowance = (amount / dailyStandard).toFixed(1);

      if (Number(daysOfAllowance) < 1) {
        return `${pct}% of monthly pocket money`;
      }
      return `${pct}% of pocket money (~${daysOfAllowance} days allowance)`;
    } else {
      const wage = settings.hourlyWage > 0 ? settings.hourlyWage : 400;
      const hours = amount / wage;
      if (hours < 1) {
        const minutes = Math.round(hours * 60);
        return `${minutes} min${minutes === 1 ? '' : 's'} of work`;
      }
      return `${hours.toFixed(1)} hrs of work`;
    }
  };

  // 🛡️ Impulse Savings Counter
  const getImpulseSavings = () => {
    return wishlist
      .filter(w => w.status === 'cancelled')
      .reduce((sum, w) => sum + Number(w.amount), 0);
  };

  const badges = INITIAL_BADGES.map(b => ({
    ...b,
    unlockedAt: settings.unlockedBadges.includes(b.id) ? 1 : undefined,
  }));

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        wishlist,
        subscriptions,
        settings,
        badges,
        addExpense,
        deleteExpense,
        rateExpense,
        addWishlistItem,
        resolveWishlistItem,
        deleteWishlistItem,
        addSubscription,
        toggleSubscription,
        deleteSubscription,
        updateSettings,
        getDailyAllowance,
        getForecast,
        getBudgetEquivalency,
        getImpulseSavings,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
}
