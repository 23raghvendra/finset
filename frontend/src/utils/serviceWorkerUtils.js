// Service Worker registration and management utilities

let swRegistration = null;

// Register Service Worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js');
      
      console.log('Service Worker registered successfully:', swRegistration);
      
      // Listen for service worker updates
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is available
            console.log('New service worker available');
            
            // You can show a notification to user about updates
            showUpdateAvailableNotification();
          }
        });
      });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      
      // Setup background sync if supported
      if ('sync' in swRegistration) {
        console.log('Background Sync supported');
        scheduleBackgroundSync();
      }
      
      // Setup periodic background sync if supported
      if ('periodicSync' in swRegistration) {
        console.log('Periodic Background Sync supported');
        await setupPeriodicSync();
      }
      
      return swRegistration;
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.log('Service Worker not supported');
    return null;
  }
};

// Handle messages from service worker
const handleServiceWorkerMessage = (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'NOTIFICATION_CLICKED':
      handleNotificationClick(data);
      break;
    case 'BACKGROUND_SYNC_COMPLETE':
      console.log('Background sync completed:', data);
      break;
    default:
      console.log('Unknown service worker message:', type, data);
  }
};

// Handle notification clicks
const handleNotificationClick = (data) => {
  console.log('Notification clicked:', data);
  
  // Navigate to relevant section based on notification type
  if (data.type === 'bill_reminder') {
    // Navigate to reminders page
    window.location.hash = '#reminders';
  } else if (data.type === 'budget_exceeded' || data.type === 'budget_warning') {
    // Navigate to budgets page
    window.location.hash = '#budgets';
  } else if (data.type === 'recurring_due') {
    // Navigate to recurring transactions
    window.location.hash = '#recurring';
  }
  
  // You can also dispatch custom events to update the UI
  window.dispatchEvent(new CustomEvent('notificationClicked', {
    detail: data
  }));
};

// Schedule background sync
const scheduleBackgroundSync = () => {
  if (swRegistration && 'sync' in swRegistration) {
    swRegistration.sync.register('financial-reminders-check').then(() => {
      console.log('Background sync registered');
    }).catch(error => {
      console.error('Background sync registration failed:', error);
    });
  }
};

// Setup periodic background sync
const setupPeriodicSync = async () => {
  if (swRegistration && 'periodicSync' in swRegistration) {
    try {
      const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
      
      if (status.state === 'granted') {
        await swRegistration.periodicSync.register('daily-financial-check', {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        });
        console.log('Periodic sync registered for daily checks');
      } else {
        console.log('Periodic sync permission not granted');
      }
    } catch (error) {
      console.error('Periodic sync setup failed:', error);
    }
  }
};

// Send message to service worker
export const sendMessageToServiceWorker = (message) => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
};

// Schedule a reminder via service worker
export const scheduleReminder = (reminderData) => {
  sendMessageToServiceWorker({
    type: 'SCHEDULE_REMINDER',
    data: reminderData
  });
};

// Cancel a reminder via service worker
export const cancelReminder = (reminderId) => {
  sendMessageToServiceWorker({
    type: 'CANCEL_REMINDER',
    data: { id: reminderId }
  });
};

// Update notification settings via service worker
export const updateServiceWorkerSettings = (settings) => {
  sendMessageToServiceWorker({
    type: 'UPDATE_NOTIFICATION_SETTINGS',
    data: settings
  });
};

// Show update available notification
const showUpdateAvailableNotification = () => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('FinanceAI Update Available', {
      body: 'A new version of FinanceAI is available. Refresh to update.',
      icon: '/favicon.ico',
      tag: 'app-update',
      actions: [
        { action: 'refresh', title: 'Refresh Now' },
        { action: 'later', title: 'Later' }
      ]
    });
  }
};

// Check for service worker updates
export const checkForUpdates = () => {
  if (swRegistration) {
    swRegistration.update();
  }
};

// Unregister service worker
export const unregisterServiceWorker = async () => {
  if (swRegistration) {
    const unregistered = await swRegistration.unregister();
    console.log('Service Worker unregistered:', unregistered);
    return unregistered;
  }
  return false;
};

// Get service worker registration status
export const getServiceWorkerStatus = () => {
  if (!('serviceWorker' in navigator)) {
    return 'not_supported';
  }
  
  if (swRegistration) {
    if (swRegistration.active) {
      return 'active';
    } else if (swRegistration.installing) {
      return 'installing';
    } else if (swRegistration.waiting) {
      return 'waiting';
    }
  }
  
  return 'not_registered';
};

// Enhanced notification with service worker
export const showEnhancedNotification = async (notificationData) => {
  if (swRegistration) {
    try {
      await swRegistration.showNotification(notificationData.title, {
        body: notificationData.message,
        icon: notificationData.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: notificationData.tag || notificationData.type,
        data: notificationData.data || {},
        actions: notificationData.actions || [],
        requireInteraction: notificationData.priority === 'high',
        silent: false,
        vibrate: notificationData.priority === 'high' ? [200, 100, 200] : [100]
      });
      
      console.log('Enhanced notification shown:', notificationData.title);
      return true;
      
    } catch (error) {
      console.error('Failed to show enhanced notification:', error);
      return false;
    }
  } else {
    // Fallback to regular notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationData.title, {
        body: notificationData.message,
        icon: notificationData.icon || '/favicon.ico',
        tag: notificationData.tag || notificationData.type
      });
      return true;
    }
  }
  
  return false;
};

// Initialize service worker and notification system
export const initializeNotificationSystem = async () => {
  console.log('Initializing notification system...');
  
  try {
    // Register service worker
    const registration = await registerServiceWorker();
    
    if (registration) {
      console.log('✅ Service Worker registered successfully');
      
      // Request notification permission if not already granted
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }
      
      return {
        serviceWorker: true,
        notifications: Notification.permission === 'granted',
        registration
      };
    } else {
      return {
        serviceWorker: false,
        notifications: false,
        registration: null
      };
    }
    
  } catch (error) {
    console.error('Failed to initialize notification system:', error);
    return {
      serviceWorker: false,
      notifications: false,
      error: error.message
    };
  }
};

// Check if notifications are properly configured
export const isNotificationSystemReady = () => {
  return (
    'serviceWorker' in navigator &&
    'Notification' in window &&
    Notification.permission === 'granted' &&
    swRegistration &&
    swRegistration.active
  );
};

// Get system capabilities
export const getNotificationCapabilities = () => {
  return {
    serviceWorker: 'serviceWorker' in navigator,
    notifications: 'Notification' in window,
    permission: 'Notification' in window ? Notification.permission : 'not_supported',
    backgroundSync: 'serviceWorker' in navigator && 'sync' in (swRegistration || {}),
    periodicSync: 'serviceWorker' in navigator && 'periodicSync' in (swRegistration || {}),
    pushNotifications: 'serviceWorker' in navigator && 'PushManager' in window
  };
};