import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
};

type ExpenseContextType = {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(
  undefined
);

const STORAGE_KEY = '@expenses';

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // 🔵 Load expenses on app start
  useEffect(() => {
    loadExpenses();
  }, []);

  // 🔵 Save expenses whenever they change
  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  const loadExpenses = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setExpenses(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Failed to load expenses', error);
    }
  };

  const saveExpenses = async (data: Expense[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.log('Failed to save expenses', error);
    }
  };

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense }}>
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
