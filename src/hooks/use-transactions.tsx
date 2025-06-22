"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Mock `uuid` as it's not in dependencies
const mockUuid = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

const initialTransactions: Transaction[] = [
  { id: mockUuid(), type: 'income', amount: 5000, category: 'Salário', date: new Date('2024-05-05'), isRecurring: true, notes: 'Salário mensal' },
  { id: mockUuid(), type: 'expense', amount: 800, category: 'Moradia', date: new Date('2024-05-10'), isRecurring: true, notes: 'Aluguel' },
  { id: mockUuid(), type: 'expense', amount: 350, category: 'Alimentação', date: new Date('2024-05-12'), isRecurring: false, notes: 'Compras no supermercado' },
  { id: mockUuid(), type: 'expense', amount: 120, category: 'Transporte', date: new Date('2024-05-15'), isRecurring: false, notes: 'Gasolina' },
  { id: mockUuid(), type: 'expense', amount: 200, category: 'Lazer', date: new Date('2024-05-20'), isRecurring: false, notes: 'Cinema e jantar' },
  { id: mockUuid(), type: 'income', amount: 750, category: 'Freelancer', date: new Date('2024-05-22'), isRecurring: false, notes: 'Projeto de design' },
];


export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: mockUuid() }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev =>
      prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};
