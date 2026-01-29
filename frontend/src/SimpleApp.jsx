import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './App.css';
import './index.css';

function SimpleAppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isDark, toggleTheme } = useTheme();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="card">
            <h2>💰 Dashboard</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="card summary-card income-card">
                <div className="summary-icon">💰</div>
                <div className="summary-content">
                  <h3>Total Income</h3>
                  <p className="summary-amount text-green-600">₹0</p>
                </div>
              </div>
              <div className="card summary-card expense-card">
                <div className="summary-icon">💸</div>
                <div className="summary-content">
                  <h3>Total Expenses</h3>
                  <p className="summary-amount text-red-600">₹0</p>
                </div>
              </div>
              <div className="card summary-card balance-card">
                <div className="summary-icon">📊</div>
                <div className="summary-content">
                  <h3>Net Balance</h3>
                  <p className="summary-amount text-green-600">₹0</p>
                </div>
              </div>
            </div>
            <div className="empty-state" style={{ marginTop: '2rem' }}>
              <div className="empty-icon">📋</div>
              <h3>No transactions yet</h3>
              <p>Start by adding your first transaction</p>
              <button className="btn btn-primary">Add First Transaction</button>
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="card">
            <h2>💳 Transactions</h2>
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No transactions found</h3>
              <p>You haven't added any transactions yet.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="card">
            <h2>{activeTab}</h2>
            <p>This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <div className="logo-section">
                <div className="logo-container">
                  <span className="logo-icon">💰</span>
                  <div className="logo-text">
                    <h1 className="app-title">FinanceAI</h1>
                    <span className="app-subtitle">Smart Money Management</span>
                  </div>
                </div>
              </div>
            </div>
            
            <nav className="nav-tabs">
              <button
                className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
              </button>
              <button
                className={`nav-tab ${activeTab === 'transactions' ? 'active' : ''}`}
                onClick={() => setActiveTab('transactions')}
              >
                <span className="nav-icon">💳</span>
                <span className="nav-text">Transactions</span>
              </button>
              <button
                className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <span className="nav-icon">📈</span>
                <span className="nav-text">Analytics</span>
              </button>
              
              <div className="nav-actions">
                <button
                  className="theme-toggle"
                  onClick={toggleTheme}
                  title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                >
                  <span className="theme-icon">{isDark ? '☀️' : '🌙'}</span>
                </button>
                <button className="btn btn-primary add-transaction-btn">
                  <span className="btn-icon">+</span>
                  <span className="btn-text">Add Transaction</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function SimpleApp() {
  return (
    <ThemeProvider>
      <SimpleAppContent />
    </ThemeProvider>
  );
}

export default SimpleApp;