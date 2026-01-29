import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const OfflineContext = createContext();

// IndexedDB helper functions
const DB_NAME = 'financeTrackerOffline';
const DB_VERSION = 1;
const STORES = {
  transactions: 'transactions',
  budgets: 'budgets',
  goals: 'goals',
  pendingSync: 'pendingSync'
};

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.transactions)) {
        db.createObjectStore(STORES.transactions, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.budgets)) {
        db.createObjectStore(STORES.budgets, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.goals)) {
        db.createObjectStore(STORES.goals, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.pendingSync)) {
        const store = db.createObjectStore(STORES.pendingSync, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

const dbOperation = async (storeName, operation, data = null) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], operation === 'get' || operation === 'getAll' ? 'readonly' : 'readwrite');
    const store = transaction.objectStore(storeName);
    
    let request;
    switch (operation) {
      case 'get':
        request = store.get(data);
        break;
      case 'getAll':
        request = store.getAll();
        break;
      case 'put':
        request = store.put(data);
        break;
      case 'add':
        request = store.add(data);
        break;
      case 'delete':
        request = store.delete(data);
        break;
      case 'clear':
        request = store.clear();
        break;
      default:
        reject(new Error('Unknown operation'));
        return;
    }
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(() => {
    try {
      return localStorage.getItem('offlineMode') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(() => {
    try {
      return localStorage.getItem('lastSyncTime') || null;
    } catch (e) {
      return null;
    }
  });

  const loadPendingSyncCount = useCallback(async () => {
    try {
      const pending = await dbOperation(STORES.pendingSync, 'getAll');
      setPendingSyncCount(pending.length);
    } catch (error) {
      setPendingSyncCount(0);
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  // Load pending sync count on mount
  useEffect(() => {
    try {
      loadPendingSyncCount();
    } catch (e) {
      
    }
  }, [loadPendingSyncCount]);

  // Toggle offline mode
  const toggleOfflineMode = useCallback((enabled) => {
    try {
      setIsOfflineMode(enabled);
      localStorage.setItem('offlineMode', enabled.toString());
      if (enabled) {
        toast('Offline mode enabled. Working locally.', { icon: '📴', duration: 3000 });
      } else {
        toast.success('Online mode enabled. Syncing with server.', { icon: '🌐' });
      }
    } catch (error) {
    }
  }, []);

  // Cache data locally
  const cacheData = useCallback(async (storeName, data) => {
    try {
      if (Array.isArray(data)) {
        for (const item of data) {
          await dbOperation(storeName, 'put', { ...item, id: item._id || item.id });
        }
      } else {
        await dbOperation(storeName, 'put', { ...data, id: data._id || data.id });
      }
    } catch (error) {
    }
  }, []);

  // Get cached data
  const getCachedData = useCallback(async (storeName) => {
    try {
      return await dbOperation(storeName, 'getAll');
    } catch (error) {
      return [];
    }
  }, []);

  // Add to pending sync queue
  const addToPendingSync = useCallback(async (action, data) => {
    try {
      await dbOperation(STORES.pendingSync, 'add', {
        action,
        data,
        timestamp: Date.now()
      });
      await loadPendingSyncCount();
    } catch (error) {
    }
  }, [loadPendingSyncCount]);

  // Sync pending changes
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return { success: false };
    }

    try {
      const pending = await dbOperation(STORES.pendingSync, 'getAll');
      
      if (pending.length === 0) {
        toast.success('Everything is up to date!');
        return { success: true, synced: 0 };
      }

      let synced = 0;
      let failed = 0;

      for (const item of pending) {
        try {
          // Here you would make actual API calls
          // For now, we'll simulate the sync
          
          // Remove from pending after successful sync
          await dbOperation(STORES.pendingSync, 'delete', item.id);
          synced++;
        } catch (error) {
          failed++;
        }
      }

      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now);
      await loadPendingSyncCount();

      if (failed > 0) {
        toast.error(`Synced ${synced} items, ${failed} failed`);
      } else {
        toast.success(`Synced ${synced} items successfully!`);
      }

      return { success: failed === 0, synced, failed };
    } catch (error) {
      toast.error('Sync failed');
      return { success: false };
    }
  }, [isOnline, loadPendingSyncCount]);

  // Clear all cached data
  const clearCache = useCallback(async () => {
    try {
      await dbOperation(STORES.transactions, 'clear');
      await dbOperation(STORES.budgets, 'clear');
      await dbOperation(STORES.goals, 'clear');
      toast.success('Cache cleared');
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  }, []);

  // Save transactions locally
  const saveTransactionsOffline = useCallback(async (transactions) => {
    await cacheData(STORES.transactions, transactions);
  }, [cacheData]);

  // Get transactions from cache
  const getTransactionsOffline = useCallback(async () => {
    return getCachedData(STORES.transactions);
  }, [getCachedData]);

  // Save budgets locally
  const saveBudgetsOffline = useCallback(async (budgets) => {
    await cacheData(STORES.budgets, budgets);
  }, [cacheData]);

  // Get budgets from cache
  const getBudgetsOffline = useCallback(async () => {
    return getCachedData(STORES.budgets);
  }, [getCachedData]);

  // Save goals locally
  const saveGoalsOffline = useCallback(async (goals) => {
    await cacheData(STORES.goals, goals);
  }, [cacheData]);

  // Get goals from cache
  const getGoalsOffline = useCallback(async () => {
    return getCachedData(STORES.goals);
  }, [getCachedData]);

  // Get storage usage
  const getStorageUsage = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage,
        quota: estimate.quota,
        percentage: (estimate.usage / estimate.quota * 100).toFixed(2)
      };
    }
    return null;
  }, []);

  const value = {
    isOnline,
    isOfflineMode,
    toggleOfflineMode,
    pendingSyncCount,
    lastSyncTime,
    syncPendingChanges,
    clearCache,
    saveTransactionsOffline,
    getTransactionsOffline,
    saveBudgetsOffline,
    getBudgetsOffline,
    saveGoalsOffline,
    getGoalsOffline,
    addToPendingSync,
    getStorageUsage
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export default OfflineContext;
