// Service Worker for FinanceAI - Enhanced Notifications & Background Processing
const CACHE_NAME = 'financeai-v1';
const NOTIFICATION_CACHE = 'financeai-notifications';

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('FinanceAI Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/main.jsx',
        '/src/App.jsx',
        '/manifest.json'
      ]).catch((error) => {
        console.warn('Cache installation failed:', error);
      });
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('FinanceAI Service Worker activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== NOTIFICATION_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data || {};
  
  event.waitUntil(
    clients.matchAll().then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url === self.location.origin && 'focus' in client) {
          return client.focus().then(() => {
            // Send message to client with action details
            return client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              action,
              data: notificationData
            });
          });
        }
      }
      
      // Open new window if no existing window found
      if (clients.openWindow) {
        return clients.openWindow('/').then((client) => {
          if (client) {
            return client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              action,
              data: notificationData
            });
          }
        });
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
  
  // Track notification dismissals for analytics
  const notificationData = event.notification.data || {};
  
  // You can send analytics data here
  if (notificationData.track) {
    // Analytics tracking code
  }
});

// Background sync for periodic checks
self.addEventListener('sync', (event) => {
  if (event.tag === 'financial-reminders-check') {
    console.log('Background sync: Checking financial reminders...');
    
    event.waitUntil(
      checkFinancialReminders()
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-financial-check') {
    console.log('Periodic sync: Daily financial check...');
    
    event.waitUntil(
      performDailyFinancialCheck()
    );
  }
});

// Message handling from main app
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SCHEDULE_REMINDER':
      scheduleReminder(data);
      break;
    case 'CANCEL_REMINDER':
      cancelReminder(data.id);
      break;
    case 'UPDATE_NOTIFICATION_SETTINGS':
      updateNotificationSettings(data);
      break;
    default:
      console.log('Unknown message type:', type);
  }
});

// Helper function to check financial reminders
async function checkFinancialReminders() {
  try {
    // Get data from IndexedDB or localStorage
    const reminders = await getStoredReminders();
    const transactions = await getStoredTransactions();
    const budgets = await getStoredBudgets();
    
    const now = new Date();
    const alerts = [];
    
    // Check for due reminders
    reminders.forEach(reminder => {
      if (reminder.status === 'active') {
        const reminderDate = new Date(reminder.reminderDate);
        const dueDate = new Date(reminder.dueDate);
        
        // Show notification if reminder time has passed
        if (reminderDate <= now && dueDate >= now) {
          alerts.push({
            type: 'reminder',
            title: 'Bill Reminder',
            body: reminder.title,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `reminder-${reminder.id}`,
            data: {
              type: 'bill_reminder',
              id: reminder.id,
              amount: reminder.amount,
              category: reminder.category
            },
            actions: [
              { action: 'mark-paid', title: 'Mark as Paid' },
              { action: 'snooze', title: 'Snooze' }
            ]
          });
        }
      }
    });
    
    // Check budget alerts
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    budgets.forEach(budget => {
      const spent = calculateBudgetSpent(transactions, budget, currentMonth, currentYear);
      const percentage = (spent / budget.amount) * 100;
      
      if (percentage >= 100) {
        alerts.push({
          type: 'budget_exceeded',
          title: 'Budget Exceeded!',
          body: `You've exceeded your ${budget.category} budget`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `budget-exceeded-${budget.id}`,
          data: {
            type: 'budget_exceeded',
            category: budget.category,
            spent,
            budget: budget.amount
          },
          requireInteraction: true
        });
      } else if (percentage >= 80) {
        alerts.push({
          type: 'budget_warning',
          title: 'Budget Alert',
          body: `You've used ${percentage.toFixed(1)}% of your ${budget.category} budget`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `budget-warning-${budget.id}`,
          data: {
            type: 'budget_warning',
            category: budget.category,
            spent,
            budget: budget.amount,
            percentage
          }
        });
      }
    });
    
    // Show notifications
    for (const alert of alerts) {
      await self.registration.showNotification(alert.title, alert);
    }
    
    console.log(`Showed ${alerts.length} financial alerts`);
    
  } catch (error) {
    console.error('Error checking financial reminders:', error);
  }
}

// Perform daily financial check
async function performDailyFinancialCheck() {
  try {
    const settings = await getNotificationSettings();
    
    if (settings.dailyDigest) {
      const summary = await generateDailySummary();
      
      await self.registration.showNotification('Daily Financial Summary', {
        body: `Today: ₹${summary.expenses} spent, ₹${summary.income} earned`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'daily-summary',
        data: {
          type: 'daily_summary',
          summary
        }
      });
    }
    
  } catch (error) {
    console.error('Error in daily financial check:', error);
  }
}

// Helper functions for data access
async function getStoredReminders() {
  try {
    // Try to get from IndexedDB first, fallback to localStorage
    const reminders = localStorage.getItem('finance-tracker-reminders');
    return reminders ? JSON.parse(reminders) : [];
  } catch (error) {
    console.error('Error getting stored reminders:', error);
    return [];
  }
}

async function getStoredTransactions() {
  try {
    const transactions = localStorage.getItem('finance-tracker-transactions');
    return transactions ? JSON.parse(transactions) : [];
  } catch (error) {
    console.error('Error getting stored transactions:', error);
    return [];
  }
}

async function getStoredBudgets() {
  try {
    const budgets = localStorage.getItem('finance-tracker-budgets');
    return budgets ? JSON.parse(budgets) : [];
  } catch (error) {
    console.error('Error getting stored budgets:', error);
    return [];
  }
}

async function getNotificationSettings() {
  try {
    const settings = localStorage.getItem('finance-tracker-notification-settings');
    return settings ? JSON.parse(settings) : {
      browserNotifications: true,
      dailyDigest: false,
      budgetAlerts: true,
      billReminders: true
    };
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return {};
  }
}

function calculateBudgetSpent(transactions, budget, month, year) {
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
}

async function generateDailySummary() {
  const transactions = await getStoredTransactions();
  const today = new Date().toDateString();
  
  const todayTransactions = transactions.filter(t => 
    new Date(t.date).toDateString() === today
  );
  
  const income = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return { income, expenses, balance: income - expenses };
}

// Schedule reminder function
function scheduleReminder(reminderData) {
  // Store reminder for background processing
  console.log('Scheduled reminder:', reminderData);
  
  // You can implement more sophisticated scheduling here
  // For now, it will be handled by the periodic checks
}

// Cancel reminder function
function cancelReminder(reminderId) {
  console.log('Cancelled reminder:', reminderId);
  
  // Close any active notifications for this reminder
  self.registration.getNotifications().then(notifications => {
    notifications.forEach(notification => {
      if (notification.tag === `reminder-${reminderId}`) {
        notification.close();
      }
    });
  });
}

// Update notification settings
function updateNotificationSettings(newSettings) {
  console.log('Updated notification settings:', newSettings);
  // Settings are handled by the main app and stored in localStorage
}

// Handle push notifications (for future implementation)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.tag,
        data: data.data || {},
        actions: data.actions || []
      })
    );
  }
});

console.log('FinanceAI Service Worker loaded successfully');