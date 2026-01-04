export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: 'Food' | 'Travel' | 'Bills';
  createdAt: number;
};
