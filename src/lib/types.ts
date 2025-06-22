export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: Date;
  isRecurring: boolean;
  notes?: string;
};

export const expenseCategories = [
  'Alimentação',
  'Transporte',
  'Lazer',
  'Moradia',
  'Saúde',
  'Educação',
  'Compras',
  'Outros',
] as const;

export const incomeSources = [
  'Salário',
  'Freelancer',
  'Investimentos',
  'Vendas',
  'Outros',
] as const;

export type ExpenseCategory = typeof expenseCategories[number];
export type IncomeSource = typeof incomeSources[number];
