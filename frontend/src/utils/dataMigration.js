import { getCategories as getCategoriesAPI, createCategory, initDefaultCategories } from '../api/categoryAPI';
import { getPreferences, updatePreferences } from '../api/planningAPI';
import toast from 'react-hot-toast';

/**
 * Migrate localStorage categories to MongoDB
 */
export const migrateCategoriesToDB = async () => {
  try {
    const MIGRATION_KEY = 'categories_migrated';
    
    if (localStorage.getItem(MIGRATION_KEY) === 'true') {
      return { success: true, message: 'Already migrated' };
    }

    const localCategories = JSON.parse(localStorage.getItem('finance_categories') || 'null');
    
    if (!localCategories) {
      await initDefaultCategories();
      localStorage.setItem(MIGRATION_KEY, 'true');
      return { success: true, message: 'Initialized defaults' };
    }

    try {
      const dbCategories = await getCategoriesAPI();
      if (dbCategories.income.length > 0 || dbCategories.expense.length > 0) {
        localStorage.setItem(MIGRATION_KEY, 'true');
        return { success: true, message: 'DB already populated' };
      }
    } catch (error) {
      
    }

    const defaultCategories = {
      income: ['Salary', 'Freelance', 'Investment', 'Business', 'Other'],
      expense: ['Food & Dining', 'Shopping', 'Transportation', 'Bills & Utilities', 
                'Entertainment', 'Healthcare', 'Education', 'Travel', 'Groceries', 'Other']
    };

    let migratedCount = 0;

    for (const type of ['income', 'expense']) {
      const categories = localCategories[type] || [];
      for (const categoryName of categories) {
        if (defaultCategories[type].includes(categoryName)) {
          continue;
        }
        
        try {
          await createCategory(categoryName, type);
          migratedCount++;
        } catch (error) {
          
        }
      }
    }

    await initDefaultCategories();
    localStorage.setItem(MIGRATION_KEY, 'true');

    return {
      success: true,
      message: `Migrated ${migratedCount} custom categories`,
      count: migratedCount
    };
  } catch (error) {
    console.error('Category migration error:', error);
    return {
      success: false,
      message: 'Migration failed',
      error: error.message
    };
  }
};

/**
 * Migrate user preferences to MongoDB
 */
export const migratePreferencesToDB = async () => {
  try {
    const MIGRATION_KEY = 'preferences_migrated';
    
    if (localStorage.getItem(MIGRATION_KEY) === 'true') {
      return { success: true, message: 'Already migrated' };
    }

    try {
      const dbPrefs = await getPreferences();
      if (dbPrefs && Object.keys(dbPrefs).length > 0) {
        localStorage.setItem(MIGRATION_KEY, 'true');
        return { success: true, message: 'DB already populated' };
      }
    } catch (error) {
      
    }

    const preferences = {
      theme: localStorage.getItem('theme') || 'light',
      offlineMode: localStorage.getItem('offlineMode') === 'true',
      virtualScroll: localStorage.getItem('virtualScrollEnabled') === 'true',
      dashboardLayout: JSON.parse(localStorage.getItem('dashboardLayout') || '[]')
    };

    await updatePreferences(preferences);
    localStorage.setItem(MIGRATION_KEY, 'true');

    return {
      success: true,
      message: 'Preferences migrated successfully'
    };
  } catch (error) {
    console.error('Preferences migration error:', error);
    return {
      success: false,
      message: 'Migration failed',
      error: error.message
    };
  }
};

/**
 * Run all migrations
 */
export const runMigrations = async () => {
  const loadingToast = toast.loading('Migrating your data to database...');
  
  try {
    const results = {
      categories: await migrateCategoriesToDB(),
      preferences: await migratePreferencesToDB()
    };

    const allSuccess = results.categories.success && results.preferences.success;

    if (allSuccess) {
      toast.success('Data migrated successfully!', { id: loadingToast });
    } else {
      toast.error('Some migrations failed. Check console for details.', { id: loadingToast });
    }

    return results;
  } catch (error) {
    toast.error('Migration failed', { id: loadingToast });
    console.error('Migration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if migrations are needed
 */
export const needsMigration = () => {
  const categoriesMigrated = localStorage.getItem('categories_migrated') === 'true';
  const preferencesMigrated = localStorage.getItem('preferences_migrated') === 'true';
  
  return !categoriesMigrated || !preferencesMigrated;
};
