// Reminders and Smart Alerts Utilities

const STORAGE_KEYS = {
  REMINDERS: 'finance-tracker-reminders',
  NOTIFICATION_SETTINGS: 'finance-tracker-notification-settings'
};

// Reminders Storage
export const getReminders = () => {
  try {
    const reminders = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return reminders ? JSON.parse(reminders) : [];
  } catch (error) {
    console.error('Error loading reminders:', error);
    return [];
  }
};

export const saveReminders = (reminders) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    return true;
  } catch (error) {
    console.error('Error saving reminders:', error);
    return false;
  }
};

export const addReminder = (reminderData) => {
  const reminders = getReminders();
  const newReminder = {
    id: Date.now().toString(),
    ...reminderData,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  // If recurring, calculate next due dates
  if (newReminder.isRecurring) {
    newReminder.nextDueDate = calculateNextDueDate(newReminder.frequency, newReminder.dueDate);
  }
  
  reminders.push(newReminder);
  return saveReminders(reminders) ? newReminder : null;
};

export const updateReminder = (id, updatedData) => {
  const reminders = getReminders();
  const index = reminders.findIndex(r => r.id === id);
  
  if (index !== -1) {
    reminders[index] = { 
      ...reminders[index], 
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    // If marked as completed and recurring, create next instance
    if (updatedData.status === 'completed' && reminders[index].isRecurring) {
      const nextReminder = createNextRecurringReminder(reminders[index]);
      if (nextReminder) {
        reminders.push(nextReminder);
      }
    }
    
    return saveReminders(reminders);
  }
  return false;
};

export const deleteReminder = (id) => {
  const reminders = getReminders();
  const filteredReminders = reminders.filter(r => r.id !== id);
  return saveReminders(filteredReminders);
};

// Smart Alert Functions
export const checkOverdueBudgets = (transactions, budgets) => {
  const alerts = [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  budgets.forEach(budget => {
    // Calculate spent amount for current period
    const spent = calculateBudgetSpent(transactions, budget, currentMonth, currentYear);
    const percentage = (spent / budget.amount) * 100;
    
    if (percentage >= 100) {
      alerts.push({
        type: 'budget_exceeded',
        title: 'Budget Exceeded',
        message: `You've exceeded your ${budget.category} budget by ${formatCurrency(spent - budget.amount)}`,
        amount: spent - budget.amount,
        category: budget.category,
        priority: 'high',
        icon: '🚨',
        action: 'View Budget'
      });
    } else if (percentage >= 80) {
      alerts.push({
        type: 'budget_warning',
        title: 'Budget Alert',
        message: `You've used ${percentage.toFixed(1)}% of your ${budget.category} budget`,
        amount: spent,
        category: budget.category,
        priority: 'medium',
        icon: '⚠️',
        action: 'Monitor Spending'
      });
    }
  });
  
  return alerts;
};

export const checkDueBills = (reminders) => {
  const alerts = [];
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);
  
  reminders.forEach(reminder => {
    if (reminder.status !== 'active') return;
    
    const dueDate = new Date(reminder.dueDate);
    const reminderDate = new Date(reminder.reminderDate);
    
    // Check if reminder is due or overdue
    if (reminderDate <= now && dueDate >= now) {
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      alerts.push({
        type: 'bill_due',
        title: daysUntilDue === 0 ? 'Bill Due Today' : `Bill Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`,
        message: reminder.title,
        amount: reminder.amount,
        category: reminder.category,
        priority: daysUntilDue <= 1 ? 'high' : 'medium',
        icon: daysUntilDue === 0 ? '🔴' : '📅',
        action: 'Pay Now',
        reminderId: reminder.id
      });
    }
    
    // Check if bill is overdue
    if (dueDate < now) {
      const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
      
      alerts.push({
        type: 'bill_overdue',
        title: 'Overdue Payment',
        message: `${reminder.title} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
        amount: reminder.amount,
        category: reminder.category,
        priority: 'high',
        icon: '🚨',
        action: 'Pay Immediately',
        reminderId: reminder.id
      });
    }
  });
  
  return alerts;
};

export const checkRecurringDue = (recurringTransactions) => {
  const alerts = [];
  const now = new Date();
  const today = now.toDateString();
  
  recurringTransactions.forEach(recurring => {
    if (!recurring.isActive) return;
    
    const nextDue = new Date(recurring.nextDueDate);
    const daysUntilDue = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
    
    // Alert for recurring transactions due today or tomorrow
    if (daysUntilDue >= 0 && daysUntilDue <= 1) {
      alerts.push({
        type: 'recurring_due',
        title: daysUntilDue === 0 ? 'Recurring Transaction Due' : 'Recurring Transaction Tomorrow',
        message: `${recurring.description} - ${recurring.frequency} ${recurring.type}`,
        amount: recurring.amount,
        category: recurring.category,
        priority: daysUntilDue === 0 ? 'medium' : 'low',
        icon: '🔄',
        action: 'Process Now',
        recurringId: recurring.id
      });
    }
  });
  
  return alerts;
};

// Notification Settings
export const getNotificationSettings = () => {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    return settings ? JSON.parse(settings) : getDefaultNotificationSettings();
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return getDefaultNotificationSettings();
  }
};

export const getDefaultNotificationSettings = () => {
  return {
    browserNotifications: true,
    emailNotifications: false,
    budgetAlerts: true,
    billReminders: true,
    recurringAlerts: true,
    dailyDigest: false,
    weeklyReport: true,
    reminderSound: true,
    alertTypes: {
      budget_exceeded: { enabled: true, priority: 'high' },
      budget_warning: { enabled: true, priority: 'medium' },
      bill_due: { enabled: true, priority: 'high' },
      bill_overdue: { enabled: true, priority: 'high' },
      recurring_due: { enabled: true, priority: 'medium' }
    }
  };
};

export const saveNotificationSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return false;
  }
};

// Browser Notifications
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const showBrowserNotification = (alert) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(alert.title, {
      body: alert.message,
      icon: '/favicon.ico', // You can customize this
      badge: '/favicon.ico',
      tag: alert.type,
      renotify: true,
      requireInteraction: alert.priority === 'high',
      actions: alert.action ? [
        {
          action: 'view',
          title: alert.action
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ] : []
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      // You can add navigation logic here
    };
    
    // Auto-close after 10 seconds for non-high priority
    if (alert.priority !== 'high') {
      setTimeout(() => notification.close(), 10000);
    }
    
    return notification;
  }
  return null;
};

// Recurring Reminder Functions
const createNextRecurringReminder = (completedReminder) => {
  const nextDueDate = calculateNextDueDate(completedReminder.frequency, completedReminder.dueDate);
  const nextReminderDate = calculateNextDueDate(completedReminder.frequency, completedReminder.reminderDate);
  
  return {
    id: Date.now().toString(),
    title: completedReminder.title,
    description: completedReminder.description,
    dueDate: nextDueDate,
    reminderDate: nextReminderDate,
    amount: completedReminder.amount,
    category: completedReminder.category,
    type: completedReminder.type,
    isRecurring: true,
    frequency: completedReminder.frequency,
    status: 'active',
    parentId: completedReminder.id,
    createdAt: new Date().toISOString()
  };
};

const calculateNextDueDate = (frequency, currentDate) => {
  const date = new Date(currentDate);
  
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

// Helper Functions
const calculateBudgetSpent = (transactions, budget, month, year) => {
  return transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return (
        t.type === 'expense' &&
        t.category === budget.category &&
        transactionDate.getMonth() === month &&
        transactionDate.getFullYear() === year
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Daily Reminder Check
export const checkDailyReminders = () => {
  const reminders = getReminders();
  const settings = getNotificationSettings();
  
  if (!settings.browserNotifications) return;
  
  const alerts = [];
  
  // Check all types of alerts
  alerts.push(...checkDueBills(reminders));
  
  // Show browser notifications for urgent alerts
  alerts
    .filter(alert => alert.priority === 'high' && settings.alertTypes[alert.type]?.enabled)
    .forEach(alert => showBrowserNotification(alert));
  
  return alerts;
};

// Weekly Summary
export const generateWeeklySummary = (transactions, reminders, budgets) => {
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);
  
  const weekTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= oneWeekAgo && transactionDate <= now;
  });
  
  const weeklyIncome = weekTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const weeklyExpenses = weekTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const upcomingReminders = reminders.filter(r => {
    const reminderDate = new Date(r.reminderDate);
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    return r.status === 'active' && reminderDate >= now && reminderDate <= nextWeek;
  });
  
  return {
    period: 'This Week',
    income: weeklyIncome,
    expenses: weeklyExpenses,
    balance: weeklyIncome - weeklyExpenses,
    transactionCount: weekTransactions.length,
    upcomingReminders: upcomingReminders.length,
    topCategories: getTopCategories(weekTransactions, 3)
  };
};

const getTopCategories = (transactions, limit = 5) => {
  const categoryTotals = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
  
  return Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([category, amount]) => ({ category, amount }));
};