import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { useTransactions } from './hooks/useTransactions';
import { useAdvancedFinance } from './hooks/useAdvancedFinance';
import useKeyboardShortcuts, { KeyboardShortcutsHelp } from './hooks/useKeyboardShortcuts.jsx';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DraggableDashboard from './components/DraggableDashboard';
import TransactionsPage from './pages/TransactionsPage';
import GoalsPage from './pages/GoalsPage';
import BudgetPage from './pages/BudgetPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InsightsPage from './pages/InsightsPage';
import PlanningPage from './pages/PlanningPage';
import WalletPage from './pages/WalletPage';
import SettingsPage from './pages/SettingsPage';
import AchievementsPage from './pages/AchievementsPage';
import TransactionForm from './components/TransactionForm';
import AuthPage from './components/AuthPage';
import ConfirmDialog from './components/ConfirmDialog';
import Onboarding, { SetupWizard } from './components/Onboarding';
import BankStatementImport from './components/BankStatementImport';
import OfflineIndicator from './components/OfflineIndicator';
import ReceiptScanner from './components/ReceiptScanner';
import notificationService from './services/notificationService';
import gamificationService from './services/gamificationService';
import toast from 'react-hot-toast';
import './App.css';
import './responsive.css';
import './components-responsive.css';

function AppContent() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const {
    transactions,
    totals,
    addNewTransaction,
    editTransaction,
    removeTransaction,
    getRecentTransactions,
    getMonthlyStats,
  } = useTransactions();

  const {
    budgets,
    savingsGoals,
    loading: financeLoading,
    error: financeError,
    getAnalytics,
    createBudget,
    editBudget,
    removeBudget,
    refetchBudgets,
    createSavingsGoal,
    editSavingsGoal,
    depositToGoal,
    removeSavingsGoal,
    refetchGoals
  } = useAdvancedFinance();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  // Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);

  const [useDraggableDashboard, setUseDraggableDashboard] = useState(() => {
    return localStorage.getItem('useDraggableDashboard') === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setUseDraggableDashboard(localStorage.getItem('useDraggableDashboard') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const current = localStorage.getItem('useDraggableDashboard') === 'true';
      if (current !== useDraggableDashboard) {
        setUseDraggableDashboard(current);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [useDraggableDashboard]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileSidebar(false);
      }
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check for first-time user
  useEffect(() => {
    if (isAuthenticated && user) {
      const onboardingCompleted = localStorage.getItem('onboardingCompleted');
      const setupCompleted = localStorage.getItem('setupCompleted');

      if (!onboardingCompleted) {
        setShowOnboarding(true);
      } else if (!setupCompleted) {

      }

      gamificationService.updateStreak();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && transactions.length > 0 && budgets.length > 0) {
      notificationService.checkBudgetAlerts(budgets);
    }
  }, [budgets, isAuthenticated]);

  const { showHelp, setShowHelp } = useKeyboardShortcuts({
    newTransaction: () => handleAddTransaction(),
    budget: () => setActiveTab('budget'),
    goals: () => setActiveTab('goals'),
    transactions: () => setActiveTab('transactions'),
    dashboard: () => setActiveTab('dashboard'),
    analytics: () => setActiveTab('analytics'),
    insights: () => setActiveTab('insights'),
    planning: () => setActiveTab('planning'),
    settings: () => setActiveTab('settings'),
    search: () => {
      toast('Press / to search', { icon: '🔍' });
    },
    close: () => {
      setShowTransactionForm(false);
      setShowOnboarding(false);
      setShowSetupWizard(false);
      setShowImportModal(false);
      setShowReceiptScanner(false);
      setShowHelp(false);
    },
    help: () => setShowHelp(prev => !prev),
    scan: () => setShowReceiptScanner(true)
  });

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionForm(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleDeleteTransaction = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      await removeTransaction(deleteConfirm.id);
      refetchBudgets();
    }
    setDeleteConfirm({ show: false, id: null });
  };

  const handleFormSubmit = async (transactionData) => {
    if (editingTransaction) {
      await editTransaction(editingTransaction._id || editingTransaction.id, transactionData);
    } else {
      await addNewTransaction(transactionData);

      gamificationService.onTransactionAdded(transactionData.amount, transactionData.category);
      gamificationService.incrementTransactionCount();
    }
    refetchBudgets();
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  const handleReceiptScanned = async (transactionData) => {
    await addNewTransaction(transactionData);
    gamificationService.onTransactionAdded(transactionData.amount, transactionData.category);
    gamificationService.addXP(25, 'Receipt scanned');
    toast.success('Transaction created from receipt!');
  };

  const handleFormClose = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  const handleImportTransactions = async (importedTransactions) => {
    // Add imported transactions
    for (const transaction of importedTransactions) {
      await addNewTransaction(transaction);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Optionally show setup wizard after onboarding
    // setShowSetupWizard(true);
  };

  const handleSetupComplete = (setupData) => {
    console.log('Setup data:', setupData);
    // Use setup data to create initial budgets, etc.
    if (setupData.topExpenseCategories?.length > 0 && setupData.monthlyIncome) {
      const monthlyBudget = parseFloat(setupData.monthlyIncome) * (1 - (setupData.savingsGoal || 20) / 100);
      const perCategoryBudget = monthlyBudget / setupData.topExpenseCategories.length;

      // Could auto-create budgets here
      toast.success('Your personalized setup is ready!');
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary-600)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderContent = () => {
    const props = {
      user,
      transactions,
      totals,
      budgets,
      savingsGoals,
      loading: financeLoading,
      error: financeError,
      recentTransactions: getRecentTransactions(10),
      monthlyStats: getMonthlyStats(),
      analytics: getAnalytics(transactions),
      onAddTransaction: handleAddTransaction,
      onEditTransaction: handleEditTransaction,
      onDeleteTransaction: handleDeleteTransaction,
      onImportClick: () => setShowImportModal(true),
      onScanReceipt: () => setShowReceiptScanner(true),
      createBudget,
      editBudget,
      removeBudget,
      createSavingsGoal,
      editSavingsGoal,
      depositToGoal,
      removeSavingsGoal,
      refetchGoals,
    };

    switch (activeTab) {
      case 'dashboard':
        return useDraggableDashboard ? (
          <DraggableDashboard {...props} />
        ) : (
          <Dashboard {...props} />
        );
      case 'transactions':
        return <TransactionsPage {...props} />;
      case 'wallet':
        return <WalletPage {...props} />;
      case 'goals':
        return <GoalsPage {...props} />;
      case 'budget':
        return <BudgetPage {...props} />;
      case 'analytics':
        return <AnalyticsPage {...props} />;
      case 'insights':
        return <InsightsPage {...props} />;
      case 'planning':
        return <PlanningPage {...props} />;
      case 'achievements':
        return <AchievementsPage {...props} />;
      case 'settings':
        return <SettingsPage {...props} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${showMobileSidebar ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            onClick={() => setShowMobileSidebar(false)}
          />
          {/* Sidebar Drawer */}
          <div
            className={`fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ease-out ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
              }`}
            style={{
              width: '280px',
              boxShadow: showMobileSidebar ? '4px 0 25px rgba(0, 0, 0, 0.15)' : 'none'
            }}
          >
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setShowMobileSidebar(false);
              }}
              collapsed={false}
              setCollapsed={() => { }}
              onClose={() => setShowMobileSidebar(false)}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <main
        className="flex-1 overflow-auto"
        style={{
          background: 'var(--bg-secondary)',
          paddingBottom: isMobile ? '90px' : '1.5rem',
          padding: isMobile ? '0' : '1.5rem'
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div
            className="flex items-center justify-between px-3 py-3 sticky top-0 z-20"
            style={{
              background: 'var(--card-bg)',
              borderBottom: '1px solid var(--border)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95"
              style={{ background: 'var(--hover-bg)', color: 'var(--text-primary)' }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <div className="w-10 h-10" /> {/* Spacer for alignment */}
          </div>
        )}

        {/* Page Content with mobile padding */}
        <div className={isMobile ? 'px-3 py-3' : ''}>
          {renderContent()}
        </div>
      </main>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleFormClose()}>
          <div className="modal-content animate-scale-in">
            <TransactionForm
              transaction={editingTransaction}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Onboarding */}
      <Onboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

      {/* Setup Wizard */}
      <SetupWizard
        isOpen={showSetupWizard}
        onClose={() => setShowSetupWizard(false)}
        onComplete={handleSetupComplete}
      />

      {/* Bank Statement Import */}
      <BankStatementImport
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportTransactions}
      />

      {/* Receipt Scanner */}
      <ReceiptScanner
        isOpen={showReceiptScanner}
        onClose={() => setShowReceiptScanner(false)}
        onTransactionCreated={handleReceiptScanned}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Offline Indicator Banner */}
      <OfflineIndicator />

      {/* Keyboard shortcut hint - Bottom Left (Desktop only) */}
      {!isMobile && (
        <div
          className="fixed bottom-6 left-6 text-xs px-3 py-1.5 rounded-lg opacity-60 hover:opacity-100 transition-all cursor-pointer z-30"
          style={{ background: 'var(--card-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          onClick={() => setShowHelp(true)}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-600)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Press <kbd className="px-1.5 py-0.5 rounded font-semibold" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>?</kbd> for shortcuts
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-30"
          style={{
            background: 'var(--card-bg)',
            borderTop: '1px solid var(--border)',
            paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div className="flex items-center justify-around px-1 pt-1.5">
            {[
              { id: 'dashboard', icon: '🏠', label: 'Home' },
              { id: 'transactions', icon: '💳', label: 'Txns' },
              { id: 'budget', icon: '📊', label: 'Budget' },
              { id: 'analytics', icon: '📈', label: 'Stats' },
              { id: 'settings', icon: '⚙️', label: 'More' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 min-w-[56px]"
                  style={{
                    color: isActive ? 'var(--primary-600)' : 'var(--text-muted)',
                    background: isActive ? 'var(--primary-100)' : 'transparent'
                  }}
                >
                  <span
                    className="text-lg mb-0.5 transition-transform duration-200"
                    style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
                  >
                    {tab.icon}
                  </span>
                  <span
                    className="text-[10px] font-medium transition-all duration-200"
                    style={{
                      opacity: isActive ? 1 : 0.7,
                      fontWeight: isActive ? 600 : 500
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <OfflineProvider>
        <AppContent />
      </OfflineProvider>
    </ThemeProvider>
  );
}

export default App;
