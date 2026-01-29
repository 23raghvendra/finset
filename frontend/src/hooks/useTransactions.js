import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ income: 0, expenses: 0, balance: 0 });
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

  // Load transactions from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions();
    }
  }, [isAuthenticated]);

  // Recalculate totals whenever transactions change
  useEffect(() => {
    const calculatedTotals = calculateTotals(transactions);
    calculatedTotals.balance = calculatedTotals.income - calculatedTotals.expenses;
    setTotals(calculatedTotals);
  }, [transactions]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionAPI.getAll();
      setTransactions(response.data || []);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError(err.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (transactionList) => {
    return transactionList.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else {
          acc.expenses += transaction.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0, balance: 0 }
    );
  };

  const addNewTransaction = async (transactionData) => {
    try {
      const response = await transactionAPI.create(transactionData);
      if (response.success) {
        setTransactions(prev => [response.data, ...prev]);
        toast.success('Transaction added successfully!');
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to add transaction');
      return null;
    }
  };

  const editTransaction = async (id, updatedData) => {
    try {
      const response = await transactionAPI.update(id, updatedData);
      if (response.success) {
        setTransactions(prev =>
          prev.map(transaction =>
            transaction._id === id || transaction.id === id
              ? response.data
              : transaction
          )
        );
        toast.success('Transaction updated successfully!');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to update transaction');
      return false;
    }
  };

  const removeTransaction = async (id) => {
    try {
      const response = await transactionAPI.delete(id);
      if (response.success) {
        setTransactions(prev => prev.filter(
          transaction => transaction._id !== id && transaction.id !== id
        ));
        toast.success('Transaction deleted successfully!');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to delete transaction');
      return false;
    }
  };

  const getFilteredTransactions = (filters = {}) => {
    let filtered = [...transactions];

    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= new Date(filters.startDate) &&
          transactionDate <= new Date(filters.endDate);
      });
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm) ||
        t.category.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  };

  const getRecentTransactions = (limit = 5) => {
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  };

  const getMonthlyStats = () => {
    const monthlyData = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, balance: 0 };
      }

      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }

      monthlyData[monthKey].balance =
        monthlyData[monthKey].income - monthlyData[monthKey].expenses;
    });

    return monthlyData;
  };

  const reloadTransactions = () => {
    loadTransactions();
  };

  return {
    transactions,
    loading,
    totals,
    error,
    addNewTransaction,
    editTransaction,
    removeTransaction,
    getFilteredTransactions,
    getRecentTransactions,
    getMonthlyStats,
    reloadTransactions
  };
};