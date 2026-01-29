// Demo data for testing the finance tracker app

export const generateDemoData = () => {
  const categories = {
    income: ['Salary', 'Freelance', 'Business Income', 'Investments', 'Bonus'],
    expense: ['Food & Dining', 'Groceries', 'Transport', 'Entertainment', 'Shopping', 'Bills & Utilities', 'Healthcare', 'Education']
  };

  const incomeDescriptions = [
    'Monthly salary',
    'Freelance project payment',
    'Investment dividend',
    'Consulting work',
    'Performance bonus',
    'Side hustle income',
    'Rental income',
    'Stock options'
  ];

  const expenseDescriptions = [
    'Grocery shopping at supermarket',
    'Dinner at restaurant',
    'Gas station fuel',
    'Netflix subscription',
    'Amazon purchase',
    'Electricity bill',
    'Doctor visit',
    'Online course',
    'Coffee shop',
    'Uber ride',
    'Movie tickets',
    'Gym membership',
    'Phone bill',
    'Internet bill'
  ];

  const transactions = [];
  const now = new Date();

  // Generate 50 transactions over the last 6 months
  for (let i = 0; i < 50; i++) {
    const isIncome = Math.random() < 0.3; // 30% chance of income
    const daysAgo = Math.floor(Math.random() * 180); // Last 6 months
    const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    const type = isIncome ? 'income' : 'expense';
    const categoryList = categories[type];
    const descriptionList = isIncome ? incomeDescriptions : expenseDescriptions;
    
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];
    const description = descriptionList[Math.floor(Math.random() * descriptionList.length)];
    
    let amount;
    if (isIncome) {
      // Income: $1000-$8000
      amount = Math.floor(Math.random() * 7000) + 1000;
    } else {
      // Expenses: $5-$500
      amount = Math.floor(Math.random() * 495) + 5;
    }

    transactions.push({
      id: `demo-${Date.now()}-${i}`,
      type,
      amount,
      description,
      category,
      date: date.toISOString()
    });
  }

  // Sort by date (newest first)
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return transactions;
};

export const generateDemoBudgets = () => {
  return [
    {
      id: `budget-${Date.now()}-1`,
      category: 'Food & Dining',
      amount: 600,
      period: 'monthly',
      alertThreshold: 80,
      createdAt: new Date().toISOString()
    },
    {
      id: `budget-${Date.now()}-2`,
      category: 'Transport',
      amount: 300,
      period: 'monthly',
      alertThreshold: 85,
      createdAt: new Date().toISOString()
    },
    {
      id: `budget-${Date.now()}-3`,
      category: 'Entertainment',
      amount: 200,
      period: 'monthly',
      alertThreshold: 75,
      createdAt: new Date().toISOString()
    },
    {
      id: `budget-${Date.now()}-4`,
      category: 'Shopping',
      amount: 400,
      period: 'monthly',
      alertThreshold: 80,
      createdAt: new Date().toISOString()
    }
  ];
};

export const generateDemoSavingsGoals = () => {
  return [
    {
      id: `goal-${Date.now()}-1`,
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 3500,
      targetDate: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString(), // 1 year from now
      description: 'Build 6 months of expenses emergency fund',
      createdAt: new Date().toISOString()
    },
    {
      id: `goal-${Date.now()}-2`,
      name: 'Vacation Fund',
      targetAmount: 3000,
      currentAmount: 1200,
      targetDate: new Date(Date.now() + (180 * 24 * 60 * 60 * 1000)).toISOString(), // 6 months from now
      description: 'Save for summer vacation to Europe',
      createdAt: new Date().toISOString()
    },
    {
      id: `goal-${Date.now()}-3`,
      name: 'New Laptop',
      targetAmount: 1500,
      currentAmount: 800,
      targetDate: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)).toISOString(), // 3 months from now
      description: 'Save for a new MacBook Pro',
      createdAt: new Date().toISOString()
    }
  ];
};

export const loadDemoData = () => {
  try {
    // Generate demo transactions
    const demoTransactions = generateDemoData();
    localStorage.setItem('finance-tracker-transactions', JSON.stringify(demoTransactions));
    
    // Generate demo budgets
    const demoBudgets = generateDemoBudgets();
    localStorage.setItem('finance-tracker-budgets', JSON.stringify(demoBudgets));
    
    // Generate demo savings goals
    const demoGoals = generateDemoSavingsGoals();
    localStorage.setItem('finance-tracker-savings-goals', JSON.stringify(demoGoals));
    
    console.log('Demo data loaded successfully!');
    return true;
  } catch (error) {
    console.error('Error loading demo data:', error);
    return false;
  }
};

export const clearAllData = () => {
  try {
    localStorage.removeItem('finance-tracker-transactions');
    localStorage.removeItem('finance-tracker-budgets');
    localStorage.removeItem('finance-tracker-savings-goals');
    localStorage.removeItem('finance-tracker-recurring-transactions');
    localStorage.removeItem('ai-categorization-learning');
    
    console.log('All data cleared successfully!');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

export const exportAllData = () => {
  try {
    const data = {
      transactions: JSON.parse(localStorage.getItem('finance-tracker-transactions') || '[]'),
      budgets: JSON.parse(localStorage.getItem('finance-tracker-budgets') || '[]'),
      savingsGoals: JSON.parse(localStorage.getItem('finance-tracker-savings-goals') || '[]'),
      recurringTransactions: JSON.parse(localStorage.getItem('finance-tracker-recurring-transactions') || '[]'),
      aiLearning: JSON.parse(localStorage.getItem('ai-categorization-learning') || '{}'),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    return data;
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

export const importData = (data) => {
  try {
    if (data.transactions) {
      localStorage.setItem('finance-tracker-transactions', JSON.stringify(data.transactions));
    }
    if (data.budgets) {
      localStorage.setItem('finance-tracker-budgets', JSON.stringify(data.budgets));
    }
    if (data.savingsGoals) {
      localStorage.setItem('finance-tracker-savings-goals', JSON.stringify(data.savingsGoals));
    }
    if (data.recurringTransactions) {
      localStorage.setItem('finance-tracker-recurring-transactions', JSON.stringify(data.recurringTransactions));
    }
    if (data.aiLearning) {
      localStorage.setItem('ai-categorization-learning', JSON.stringify(data.aiLearning));
    }
    
    console.log('Data imported successfully!');
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};