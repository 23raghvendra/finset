// Local Storage utilities for Finance Tracker

const STORAGE_KEYS = {
  TRANSACTIONS: 'finance-tracker-transactions',
  CATEGORIES: 'finance-tracker-categories',
  SETTINGS: 'finance-tracker-settings',
  BUDGETS: 'finance-tracker-budgets',
  SAVINGS_GOALS: 'finance-tracker-savings-goals',
  RECURRING_TRANSACTIONS: 'finance-tracker-recurring-transactions'
};

// Transaction Storage
export const getTransactions = () => {
  try {
    const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return transactions ? JSON.parse(transactions) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const saveTransactions = (transactions) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('Error saving transactions:', error);
    return false;
  }
};

export const addTransaction = (transaction) => {
  const transactions = getTransactions();
  const newTransaction = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...transaction
  };
  transactions.unshift(newTransaction);
  return saveTransactions(transactions) ? newTransaction : null;
};

export const updateTransaction = (id, updatedTransaction) => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updatedTransaction };
    return saveTransactions(transactions);
  }
  return false;
};

export const deleteTransaction = (id) => {
  const transactions = getTransactions();
  const filteredTransactions = transactions.filter(t => t.id !== id);
  return saveTransactions(filteredTransactions);
};

// Categories Storage
export const getCategories = () => {
  try {
    const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return categories ? JSON.parse(categories) : getDefaultCategories();
  } catch (error) {
    console.error('Error loading categories:', error);
    return getDefaultCategories();
  }
};

export const getDefaultCategories = () => {
  return {
    income: [
      'Salary',
      'Business Income',
      'Freelance',
      'Investments',
      'Fixed Deposits',
      'Rental Income',
      'Gifts',
      'Bonus',
      'Other Income'
    ],
    expense: [
      'Food & Dining',
      'Groceries',
      'Transport',
      'Rent',
      'Shopping',
      'Entertainment',
      'Bills & Utilities',
      'Mobile Recharge',
      'Internet',
      'Healthcare',
      'Education',
      'Travel',
      'Insurance',
      'EMI',
      'Petrol/Diesel',
      'Auto/Taxi',
      'Clothing',
      'Personal Care',
      'Donations',
      'Other Expenses'
    ]
  };
};

export const saveCategories = (categories) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return true;
  } catch (error) {
    console.error('Error saving categories:', error);
    return false;
  }
};

export const addCustomCategory = (type, categoryName) => {
  const categories = getCategories();
  if (!categories[type].includes(categoryName)) {
    categories[type].push(categoryName);
    return saveCategories(categories);
  }
  return false;
};

export const removeCustomCategory = (type, categoryName) => {
  const categories = getCategories();
  const defaultCategories = getDefaultCategories();
  
  // Don't allow removal of default categories
  if (defaultCategories[type].includes(categoryName)) {
    return false;
  }
  
  const index = categories[type].indexOf(categoryName);
  if (index > -1) {
    categories[type].splice(index, 1);
    return saveCategories(categories);
  }
  return false;
};

// Settings Storage
export const getSettings = () => {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : getDefaultSettings();
  } catch (error) {
    console.error('Error loading settings:', error);
    return getDefaultSettings();
  }
};

export const getDefaultSettings = () => {
  return {
    currency: 'INR',
    currencySymbol: '₹',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    language: 'en'
  };
};

export const getCurrencyOptions = () => {
  return {
    INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
    EUR: { symbol: '€', name: 'Euro', locale: 'en-EU' },
    GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
    JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' }
  };
};

export const formatCurrency = (amount, currency = 'INR') => {
  const currencyOptions = getCurrencyOptions();
  const currencyInfo = currencyOptions[currency] || currencyOptions.INR;
  
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper to format amount with rupee symbol
export const formatINR = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// Data calculation utilities
export const calculateTotals = (transactions) => {
  return transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === 'income') {
        totals.income += transaction.amount;
      } else {
        totals.expenses += transaction.amount;
      }
      return totals;
    },
    { income: 0, expenses: 0, balance: 0 }
  );
};

export const getTransactionsByDateRange = (transactions, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= start && transactionDate <= end;
  });
};

export const getTransactionsByCategory = (transactions, category, type) => {
  return transactions.filter(
    transaction => 
      transaction.category === category && 
      transaction.type === type
  );
};

export const getMonthlyData = (transactions) => {
  const monthlyData = {};
  
  transactions.forEach(transaction => {
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

// Budget Management
export const getBudgets = () => {
  try {
    const budgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return budgets ? JSON.parse(budgets) : [];
  } catch (error) {
    console.error('Error loading budgets:', error);
    return [];
  }
};

export const saveBudgets = (budgets) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    return true;
  } catch (error) {
    console.error('Error saving budgets:', error);
    return false;
  }
};

export const addBudget = (budget) => {
  const budgets = getBudgets();
  const newBudget = {
    id: Date.now().toString(),
    ...budget,
    createdAt: new Date().toISOString()
  };
  budgets.push(newBudget);
  return saveBudgets(budgets) ? newBudget : null;
};

export const updateBudget = (id, updatedBudget) => {
  const budgets = getBudgets();
  const index = budgets.findIndex(b => b.id === id);
  if (index !== -1) {
    budgets[index] = { ...budgets[index], ...updatedBudget };
    return saveBudgets(budgets);
  }
  return false;
};

export const deleteBudget = (id) => {
  const budgets = getBudgets();
  const filteredBudgets = budgets.filter(b => b.id !== id);
  return saveBudgets(filteredBudgets);
};

// Savings Goals Management
export const getSavingsGoals = () => {
  try {
    const goals = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
    return goals ? JSON.parse(goals) : [];
  } catch (error) {
    console.error('Error loading savings goals:', error);
    return [];
  }
};

export const saveSavingsGoals = (goals) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
    return true;
  } catch (error) {
    console.error('Error saving savings goals:', error);
    return false;
  }
};

export const addSavingsGoal = (goal) => {
  const goals = getSavingsGoals();
  const newGoal = {
    id: Date.now().toString(),
    ...goal,
    currentAmount: 0,
    createdAt: new Date().toISOString()
  };
  goals.push(newGoal);
  return saveSavingsGoals(goals) ? newGoal : null;
};

export const updateSavingsGoal = (id, updatedGoal) => {
  const goals = getSavingsGoals();
  const index = goals.findIndex(g => g.id === id);
  if (index !== -1) {
    goals[index] = { ...goals[index], ...updatedGoal };
    return saveSavingsGoals(goals);
  }
  return false;
};

export const addToSavingsGoal = (id, amount) => {
  const goals = getSavingsGoals();
  const goal = goals.find(g => g.id === id);
  if (goal) {
    goal.currentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    return saveSavingsGoals(goals);
  }
  return false;
};

export const deleteSavingsGoal = (id) => {
  const goals = getSavingsGoals();
  const filteredGoals = goals.filter(g => g.id !== id);
  return saveSavingsGoals(filteredGoals);
};

// Recurring Transactions Management
export const getRecurringTransactions = () => {
  try {
    const recurring = localStorage.getItem(STORAGE_KEYS.RECURRING_TRANSACTIONS);
    return recurring ? JSON.parse(recurring) : [];
  } catch (error) {
    console.error('Error loading recurring transactions:', error);
    return [];
  }
};

export const saveRecurringTransactions = (recurring) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECURRING_TRANSACTIONS, JSON.stringify(recurring));
    return true;
  } catch (error) {
    console.error('Error saving recurring transactions:', error);
    return false;
  }
};

export const addRecurringTransaction = (transaction) => {
  const recurring = getRecurringTransactions();
  const newRecurring = {
    id: Date.now().toString(),
    ...transaction,
    nextDueDate: calculateNextDueDate(transaction.frequency, transaction.startDate),
    createdAt: new Date().toISOString()
  };
  recurring.push(newRecurring);
  return saveRecurringTransactions(recurring) ? newRecurring : null;
};

export const updateRecurringTransaction = (id, updatedTransaction) => {
  const recurring = getRecurringTransactions();
  const index = recurring.findIndex(r => r.id === id);
  if (index !== -1) {
    recurring[index] = { ...recurring[index], ...updatedTransaction };
    return saveRecurringTransactions(recurring);
  }
  return false;
};

export const deleteRecurringTransaction = (id) => {
  const recurring = getRecurringTransactions();
  const filteredRecurring = recurring.filter(r => r.id !== id);
  return saveRecurringTransactions(filteredRecurring);
};

// Helper function to calculate next due date
const calculateNextDueDate = (frequency, startDate) => {
  const date = new Date(startDate);
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString();
};

// Analytics and Insights
export const getCategoryBreakdown = (transactions, type = null) => {
  const breakdown = {};
  const filteredTransactions = type ? transactions.filter(t => t.type === type) : transactions;
  
  filteredTransactions.forEach(transaction => {
    if (!breakdown[transaction.category]) {
      breakdown[transaction.category] = 0;
    }
    breakdown[transaction.category] += transaction.amount;
  });
  
  return breakdown;
};

export const getSpendingTrends = (transactions, months = 6) => {
  const now = new Date();
  const trends = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === date.getFullYear() && 
             tDate.getMonth() === date.getMonth();
    });
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    trends.push({
      month: monthName,
      monthKey,
      income,
      expenses,
      balance: income - expenses
    });
  }
  
  return trends;
};

// Smart categorization patterns for Indian context
export const getCategorizationPatterns = () => {
  return {
    'food & dining': ['zomato', 'swiggy', 'dominos', 'mcdonald', 'kfc', 'pizza', 'restaurant', 'cafe', 'food', 'dining', 'biryani', 'dosa'],
    'groceries': ['bigbasket', 'grofers', 'dmart', 'reliance fresh', 'supermarket', 'grocery', 'vegetables', 'fruits'],
    'transport': ['uber', 'ola', 'metro', 'bus', 'auto', 'taxi', 'rickshaw', 'railways', 'irctc', 'petrol', 'diesel', 'parking'],
    'shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'shopping', 'mall', 'store', 'clothing', 'electronics'],
    'entertainment': ['netflix', 'hotstar', 'prime', 'spotify', 'jio', 'movie', 'cinema', 'pvr', 'inox', 'game', 'entertainment'],
    'bills & utilities': ['electricity', 'water', 'gas', 'internet', 'broadband', 'wifi', 'bill', 'utility', 'maintenance'],
    'mobile recharge': ['recharge', 'mobile', 'airtel', 'jio', 'vodafone', 'bsnl', 'prepaid', 'postpaid'],
    'healthcare': ['hospital', 'doctor', 'medicine', 'pharmacy', 'apollo', 'fortis', 'medical', 'health', 'clinic'],
    'emi': ['emi', 'loan', 'credit card', 'installment', 'bajaj', 'hdfc', 'icici', 'sbi'],
    'insurance': ['insurance', 'policy', 'premium', 'lic', 'health insurance', 'car insurance']
  };
};

export const suggestCategory = (description, type) => {
  const patterns = getCategorizationPatterns();
  const desc = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(patterns)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return category;
    }
  }
  
  return type === 'income' ? 'Other Income' : 'Other Expenses';
};