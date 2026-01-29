import { useState, useEffect } from 'react';
import { budgetAPI, goalAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useAdvancedFinance = () => {
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

  // Load all data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [budgetsResponse, goalsResponse] = await Promise.all([
        budgetAPI.getAll(),
        goalAPI.getAll()
      ]);

      setBudgets(budgetsResponse.data || []);
      setSavingsGoals(goalsResponse.data || []);
      setRecurringTransactions([]); // TODO: Implement recurring transactions API
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refetchBudgets = async () => {
    try {
      const budgetsResponse = await budgetAPI.getAll();
      setBudgets(budgetsResponse.data || []);
    } catch (err) {
      console.error('Error refetching budgets:', err);
    }
  };

  const refetchGoals = async () => {
    try {
      setError(null);
      const goalsResponse = await goalAPI.getAll();
      setSavingsGoals(goalsResponse.data || []);
    } catch (err) {
      console.error('Error refetching goals:', err);
      setError(err.message);
    }
  };

  // Budget Management
  const createBudget = async (budgetData) => {
    try {
      const response = await budgetAPI.create(budgetData);
      if (response.success) {
        await refetchBudgets();
        toast.success('Budget created successfully!');
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Error creating budget:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to create budget');
      return null;
    }
  };

  const editBudget = async (id, updatedData) => {
    try {
      const response = await budgetAPI.update(id, updatedData);
      if (response.success) {
        await refetchBudgets();
        toast.success('Budget updated successfully!');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating budget:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to update budget');
      return false;
    }
  };

  const removeBudget = async (id) => {
    try {
      const response = await budgetAPI.delete(id);
      if (response.success) {
        setBudgets(prev => prev.filter(budget => budget._id !== id && budget.id !== id));
        toast.success('Budget deleted successfully!');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting budget:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to delete budget');
      return false;
    }
  };

  const checkBudgetAlerts = (transactions) => {
    const alerts = [];

    budgets.forEach(budget => {
      // Budget data from API already includes spent, remaining, percentage
      const percentage = budget.percentage || 0;

      if (percentage >= 100) {
        alerts.push({
          type: 'danger',
          budgetId: budget._id || budget.id,
          category: budget.category,
          message: `You've exceeded ${budget.category} budget by ${(percentage - 100).toFixed(1)}%`,
          spent: budget.spent || 0,
          budget: budget.amount
        });
      } else if (percentage >= 80) {
        alerts.push({
          type: 'warning',
          budgetId: budget._id || budget.id,
          category: budget.category,
          message: `You've used ${percentage.toFixed(1)}% of your ${budget.category} budget`,
          spent: budget.spent || 0,
          budget: budget.amount
        });
      }
    });

    return alerts;
  };

  const getSpentInPeriod = (transactions, budget) => {
    const now = new Date();
    let startDate;

    if (budget.period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (budget.period === 'weekly') {
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
    }

    return transactions
      .filter(t =>
        t.type === 'expense' &&
        t.category === budget.category &&
        new Date(t.date) >= startDate &&
        new Date(t.date) <= now
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Savings Goals Management
  const createSavingsGoal = async (goalData) => {
    try {
      const response = await goalAPI.create(goalData);
      if (response.success) {
        setSavingsGoals(prev => [...prev, response.data]);
        toast.success('Savings goal created successfully!');
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Error creating savings goal:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to create savings goal');
      return null;
    }
  };

  const goalIdMatch = (goal, id) =>
    id != null && (String(goal._id) === String(id) || String(goal.id) === String(id));

  const editSavingsGoal = async (id, updatedData) => {
    try {
      const response = await goalAPI.update(id, updatedData);
      if (response.success && response.data) {
        setSavingsGoals(prev =>
          prev.map(goal => (goalIdMatch(goal, id) ? response.data : goal))
        );
        toast.success('Savings goal updated successfully!');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating savings goal:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to update savings goal');
      return false;
    }
  };

  const depositToGoal = async (id, amount) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid positive amount');
      return false;
    }
    try {
      const response = await goalAPI.contribute(id, numAmount);
      if (response.success && response.data) {
        setSavingsGoals(prev =>
          prev.map(goal => (goalIdMatch(goal, id) ? response.data : goal))
        );
        toast.success(`Successfully added ₹${numAmount.toLocaleString('en-IN')} to your goal!`);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding to savings goal:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to add deposit');
      return false;
    }
  };

  const removeSavingsGoal = async (id) => {
    try {
      const response = await goalAPI.delete(id);
      if (response.success) {
        setSavingsGoals(prev => prev.filter(goal => !goalIdMatch(goal, id)));
        toast.success('Savings goal deleted successfully!');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting savings goal:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to delete savings goal');
      return false;
    }
  };

  // Recurring Transactions Management (LocalStorage for now - TODO: Add API)
  const createRecurringTransaction = (transactionData) => {
    // TODO: Implement API endpoint
    console.warn('Recurring transactions not yet implemented in API');
    return null;
  };

  const editRecurringTransaction = (id, updatedData) => {
    // TODO: Implement API endpoint
    console.warn('Recurring transactions not yet implemented in API');
    return false;
  };

  const removeRecurringTransaction = (id) => {
    // TODO: Implement API endpoint
    console.warn('Recurring transactions not yet implemented in API');
    return false;
  };

  const getDueRecurringTransactions = () => {
    // TODO: Implement API endpoint
    return [];
  };

  // Analytics
  const getCategoryBreakdown = (transactionList, type) => {
    const breakdown = {};

    if (!transactionList || !Array.isArray(transactionList)) {
      return breakdown;
    }

    transactionList
      .filter(t => t.type === type)
      .forEach(transaction => {
        if (!breakdown[transaction.category]) {
          breakdown[transaction.category] = 0;
        }
        breakdown[transaction.category] += transaction.amount;
      });

    return breakdown;
  };

  const getSpendingTrends = (transactionList) => {
    const monthlyData = {};

    if (!transactionList || !Array.isArray(transactionList)) {
      return monthlyData;
    }

    transactionList.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    });

    return monthlyData;
  };

  const getAnalytics = (transactionList = []) => {
    const safeTransactions = transactionList || [];
    return {
      categoryBreakdown: getCategoryBreakdown(safeTransactions, 'expense'),
      incomeBreakdown: getCategoryBreakdown(safeTransactions, 'income'),
      spendingTrends: getSpendingTrends(safeTransactions),
      budgetAlerts: checkBudgetAlerts(safeTransactions)
    };
  };

  return {
    // Data
    budgets,
    savingsGoals,
    recurringTransactions,
    loading,
    error,

    // Budget functions
    createBudget,
    editBudget,
    removeBudget,
    refetchBudgets,
    checkBudgetAlerts,

    // Savings goals functions
    createSavingsGoal,
    editSavingsGoal,
    depositToGoal,
    removeSavingsGoal,
    refetchGoals,

    // Recurring transactions functions
    createRecurringTransaction,
    editRecurringTransaction,
    removeRecurringTransaction,
    getDueRecurringTransactions,

    // Analytics
    getAnalytics
  };
};