// Automated Recurring Transaction Processing Utilities

import { 
  getRecurringTransactions, 
  updateRecurringTransaction, 
  addTransaction, 
  getTransactions,
  saveTransactions 
} from './storage';
import { 
  showBrowserNotification, 
  getNotificationSettings 
} from './remindersUtils';

// Process due recurring transactions
export const processDueRecurringTransactions = () => {
  const recurringTransactions = getRecurringTransactions();
  const now = new Date();
  const processedTransactions = [];
  
  recurringTransactions.forEach(recurring => {
    if (!recurring.isActive) return;
    
    const nextDueDate = new Date(recurring.nextDueDate);
    
    // Check if transaction is due (current date >= due date)
    if (now >= nextDueDate) {
      const processed = processRecurringTransaction(recurring);
      if (processed) {
        processedTransactions.push(processed);
      }
    }
  });
  
  if (processedTransactions.length > 0) {
    // Show summary notification
    showRecurringProcessedNotification(processedTransactions);
  }
  
  return processedTransactions;
};

// Process a single recurring transaction
const processRecurringTransaction = (recurring) => {
  try {
    // Create the actual transaction
    const transactionData = {
      type: recurring.type,
      amount: recurring.amount,
      description: `${recurring.description} (Auto-generated)`,
      category: recurring.category,
      date: new Date().toISOString(),
      isRecurring: true,
      recurringId: recurring.id
    };
    
    const newTransaction = addTransaction(transactionData);
    
    if (newTransaction) {
      // Update the recurring transaction with next due date
      const nextDueDate = calculateNextDueDate(recurring.frequency, recurring.nextDueDate);
      
      updateRecurringTransaction(recurring.id, {
        nextDueDate,
        lastProcessed: new Date().toISOString(),
        processCount: (recurring.processCount || 0) + 1
      });
      
      console.log(`Processed recurring transaction: ${recurring.description}`);
      return {
        recurring,
        transaction: newTransaction
      };
    }
    
  } catch (error) {
    console.error('Error processing recurring transaction:', error);
    
    // Mark as error for manual review
    updateRecurringTransaction(recurring.id, {
      hasError: true,
      lastError: error.message,
      lastErrorDate: new Date().toISOString()
    });
  }
  
  return null;
};

// Check for transactions due in the next few days
export const getUpcomingRecurringTransactions = (daysAhead = 7) => {
  const recurringTransactions = getRecurringTransactions();
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + daysAhead);
  
  return recurringTransactions
    .filter(recurring => {
      if (!recurring.isActive) return false;
      
      const nextDueDate = new Date(recurring.nextDueDate);
      return nextDueDate >= now && nextDueDate <= futureDate;
    })
    .map(recurring => ({
      ...recurring,
      daysUntilDue: Math.ceil((new Date(recurring.nextDueDate) - now) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
};

// Calculate next due date based on frequency
const calculateNextDueDate = (frequency, currentDueDate) => {
  const date = new Date(currentDueDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'bi-weekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  
  return date.toISOString();
};

// Auto-processing settings
export const getAutoProcessingSettings = () => {
  try {
    const settings = localStorage.getItem('finance-tracker-auto-processing');
    return settings ? JSON.parse(settings) : getDefaultAutoProcessingSettings();
  } catch (error) {
    console.error('Error loading auto-processing settings:', error);
    return getDefaultAutoProcessingSettings();
  }
};

export const getDefaultAutoProcessingSettings = () => {
  return {
    enabled: false, // Disabled by default for safety
    autoProcessIncome: true,
    autoProcessExpenses: false, // More cautious with expenses
    maxAmount: 10000, // Maximum amount to auto-process
    notifyBeforeProcessing: true,
    notifyAfterProcessing: true,
    requireConfirmation: true,
    excludeCategories: ['Investments', 'Loans'], // Categories to never auto-process
    processingTime: '09:00', // Time of day to process (24-hour format)
    weekendsOnly: false,
    skipHolidays: true
  };
};

export const saveAutoProcessingSettings = (settings) => {
  try {
    localStorage.setItem('finance-tracker-auto-processing', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving auto-processing settings:', error);
    return false;
  }
};

// Smart processing with user preferences
export const smartProcessRecurringTransactions = () => {
  const settings = getAutoProcessingSettings();
  
  if (!settings.enabled) {
    console.log('Auto-processing is disabled');
    return [];
  }
  
  const recurringTransactions = getRecurringTransactions();
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  
  // Check if it's the right time to process
  if (settings.processingTime && currentTime !== settings.processingTime) {
    return [];
  }
  
  // Skip weekends if configured
  if (settings.weekendsOnly && !isWeekend) {
    return [];
  }
  
  const eligibleTransactions = recurringTransactions.filter(recurring => {
    if (!recurring.isActive) return false;
    
    // Check if due
    const nextDueDate = new Date(recurring.nextDueDate);
    if (now < nextDueDate) return false;
    
    // Check amount limits
    if (recurring.amount > settings.maxAmount) return false;
    
    // Check category exclusions
    if (settings.excludeCategories.includes(recurring.category)) return false;
    
    // Check type preferences
    if (recurring.type === 'income' && !settings.autoProcessIncome) return false;
    if (recurring.type === 'expense' && !settings.autoProcessExpenses) return false;
    
    return true;
  });
  
  if (eligibleTransactions.length === 0) {
    return [];
  }
  
  // If confirmation required, show notification instead of processing
  if (settings.requireConfirmation) {
    showConfirmationNotification(eligibleTransactions);
    return [];
  }
  
  // Process eligible transactions
  const processedTransactions = [];
  
  eligibleTransactions.forEach(recurring => {
    const processed = processRecurringTransaction(recurring);
    if (processed) {
      processedTransactions.push(processed);
    }
  });
  
  return processedTransactions;
};

// Show notification for processed transactions
const showRecurringProcessedNotification = (processedTransactions) => {
  const settings = getNotificationSettings();
  
  if (!settings.recurringAlerts) return;
  
  const totalAmount = processedTransactions.reduce((sum, p) => sum + p.transaction.amount, 0);
  
  showBrowserNotification({
    type: 'recurring_processed',
    title: `${processedTransactions.length} Recurring Transaction${processedTransactions.length > 1 ? 's' : ''} Processed`,
    message: `Total amount: ₹${totalAmount.toLocaleString()}`,
    priority: 'medium',
    icon: '🔄',
    action: 'View Transactions'
  });
};

// Show confirmation notification
const showConfirmationNotification = (eligibleTransactions) => {
  const totalAmount = eligibleTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  showBrowserNotification({
    type: 'recurring_confirmation',
    title: 'Recurring Transactions Ready',
    message: `${eligibleTransactions.length} transaction(s) ready to process (₹${totalAmount.toLocaleString()})`,
    priority: 'medium',
    icon: '❓',
    action: 'Review & Process'
  });
};

// Bulk process recurring transactions
export const bulkProcessRecurringTransactions = (recurringIds, options = {}) => {
  const processedTransactions = [];
  const errors = [];
  
  recurringIds.forEach(id => {
    const recurring = getRecurringTransactions().find(r => r.id === id);
    
    if (recurring) {
      try {
        const processed = processRecurringTransaction(recurring);
        if (processed) {
          processedTransactions.push(processed);
        }
      } catch (error) {
        errors.push({
          recurringId: id,
          error: error.message
        });
      }
    }
  });
  
  if (options.notify && processedTransactions.length > 0) {
    showRecurringProcessedNotification(processedTransactions);
  }
  
  return {
    processed: processedTransactions,
    errors
  };
};

// Undo a recurring transaction (mark as cancelled and remove transaction)
export const undoRecurringTransaction = (recurringId, transactionId) => {
  try {
    // Get transactions and remove the specific one
    const transactions = getTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== transactionId);
    saveTransactions(filteredTransactions);
    
    // Update recurring transaction to previous due date
    const recurring = getRecurringTransactions().find(r => r.id === recurringId);
    if (recurring) {
      const previousDueDate = calculatePreviousDueDate(recurring.frequency, recurring.nextDueDate);
      
      updateRecurringTransaction(recurringId, {
        nextDueDate: previousDueDate,
        processCount: Math.max((recurring.processCount || 1) - 1, 0),
        lastUndone: new Date().toISOString()
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('Error undoing recurring transaction:', error);
    return false;
  }
};

// Calculate previous due date (for undo functionality)
const calculatePreviousDueDate = (frequency, currentDueDate) => {
  const date = new Date(currentDueDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() - 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() - 7);
      break;
    case 'bi-weekly':
      date.setDate(date.getDate() - 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() - 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      date.setMonth(date.getMonth() - 1);
  }
  
  return date.toISOString();
};

// Get processing history
export const getRecurringProcessingHistory = (recurringId) => {
  const transactions = getTransactions();
  
  return transactions
    .filter(t => t.recurringId === recurringId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(t => ({
      id: t.id,
      amount: t.amount,
      date: t.date,
      description: t.description
    }));
};

// Validate recurring transaction before processing
export const validateRecurringTransaction = (recurring) => {
  const errors = [];
  
  if (!recurring.isActive) {
    errors.push('Transaction is not active');
  }
  
  if (!recurring.amount || recurring.amount <= 0) {
    errors.push('Invalid amount');
  }
  
  if (!recurring.description || recurring.description.trim().length === 0) {
    errors.push('Description is required');
  }
  
  if (!recurring.category) {
    errors.push('Category is required');
  }
  
  if (!recurring.frequency) {
    errors.push('Frequency is required');
  }
  
  const nextDueDate = new Date(recurring.nextDueDate);
  if (isNaN(nextDueDate.getTime())) {
    errors.push('Invalid due date');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Setup automatic processing intervals
export const setupAutoProcessing = () => {
  // Check every hour for due transactions
  const intervalId = setInterval(() => {
    const settings = getAutoProcessingSettings();
    
    if (settings.enabled) {
      console.log('Checking for due recurring transactions...');
      smartProcessRecurringTransactions();
    }
  }, 60 * 60 * 1000); // 1 hour
  
  // Also check on page load
  setTimeout(() => {
    const settings = getAutoProcessingSettings();
    if (settings.enabled) {
      smartProcessRecurringTransactions();
    }
  }, 5000); // 5 seconds after load
  
  return intervalId;
};

// Clear auto-processing intervals
export const clearAutoProcessing = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};