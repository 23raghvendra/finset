import React, { useState, useEffect } from 'react';
import {
  getAutoProcessingSettings,
  saveAutoProcessingSettings,
  getUpcomingRecurringTransactions,
  processDueRecurringTransactions,
  bulkProcessRecurringTransactions,
  getRecurringProcessingHistory,
  validateRecurringTransaction,
  setupAutoProcessing,
  clearAutoProcessing
} from '../utils/recurringProcessorUtils';
import { getRecurringTransactions } from '../utils/storage';
import { formatCurrency } from '../utils/storage';

const AutoProcessingManager = () => {
  const [settings, setSettings] = useState(getAutoProcessingSettings());
  const [upcomingTransactions, setUpcomingTransactions] = useState([]);
  const [processingHistory, setProcessingHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoProcessingInterval, setAutoProcessingInterval] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadUpcomingTransactions();
    
    // Setup auto-processing if enabled
    if (settings.enabled) {
      const intervalId = setupAutoProcessing();
      setAutoProcessingInterval(intervalId);
      
      return () => clearAutoProcessing(intervalId);
    }
  }, [settings.enabled]);

  const loadUpcomingTransactions = () => {
    const upcoming = getUpcomingRecurringTransactions();
    setUpcomingTransactions(upcoming);
    
    // Load processing history for recent transactions
    const recurringTransactions = getRecurringTransactions();
    const recentHistory = recurringTransactions
      .slice(0, 10)
      .map(r => ({
        recurring: r,
        history: getRecurringProcessingHistory(r.id).slice(0, 5)
      }));
    setProcessingHistory(recentHistory);
  };

  const handleSettingsChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveAutoProcessingSettings(newSettings);
  };

  const handleArraySettingChange = (key, value, action) => {
    const currentArray = settings[key] || [];
    let newArray;
    
    if (action === 'add') {
      newArray = [...currentArray, value];
    } else if (action === 'remove') {
      newArray = currentArray.filter(item => item !== value);
    } else {
      newArray = value;
    }
    
    handleSettingsChange(key, newArray);
  };

  const handleProcessSelected = async () => {
    if (selectedTransactions.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const result = await bulkProcessRecurringTransactions(selectedTransactions, {
        notify: true
      });
      
      console.log('Bulk processing result:', result);
      
      // Refresh data
      loadUpcomingTransactions();
      setSelectedTransactions([]);
      
    } catch (error) {
      console.error('Error processing selected transactions:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessAll = async () => {
    setIsProcessing(true);
    
    try {
      const processedTransactions = processDueRecurringTransactions();
      console.log('Processed transactions:', processedTransactions);
      
      // Refresh data
      loadUpcomingTransactions();
      
    } catch (error) {
      console.error('Error processing all due transactions:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTransactionSelection = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDueBadge = (daysUntilDue) => {
    if (daysUntilDue < 0) return { text: 'Overdue', class: 'overdue' };
    if (daysUntilDue === 0) return { text: 'Due Today', class: 'due-today' };
    if (daysUntilDue === 1) return { text: 'Due Tomorrow', class: 'due-tomorrow' };
    return { text: `${daysUntilDue} days`, class: 'due-later' };
  };

  return (
    <div className="auto-processing-manager">
      <div className="processing-header">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Auto-Processing Manager</h2>
            <p className="text-gray-600 mt-1">Manage automated recurring transaction processing</p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="btn btn-secondary"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="processing-status mb-6">
          <div className="card">
            <div className="status-content">
              <div className="status-indicator">
                <div className={`status-dot ${settings.enabled ? 'enabled' : 'disabled'}`}></div>
                <span className="status-text">
                  Auto-Processing {settings.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="status-info">
                <span className="info-item">
                  Next Check: {settings.processingTime || 'Manual Only'}
                </span>
                <span className="info-item">
                  Max Amount: {formatCurrency(settings.maxAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Transactions */}
      <div className="upcoming-section mb-6">
        <div className="card">
          <div className="section-header">
            <h3 className="text-lg font-semibold">Upcoming Transactions</h3>
            <div className="header-actions">
              {upcomingTransactions.length > 0 && (
                <>
                  <button
                    onClick={handleProcessAll}
                    disabled={isProcessing}
                    className="btn btn-primary"
                  >
                    {isProcessing ? 'Processing...' : 'Process All Due'}
                  </button>
                  {selectedTransactions.length > 0 && (
                    <button
                      onClick={handleProcessSelected}
                      disabled={isProcessing}
                      className="btn btn-secondary"
                    >
                      Process Selected ({selectedTransactions.length})
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {upcomingTransactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h4>No Upcoming Transactions</h4>
              <p>All your recurring transactions are up to date!</p>
            </div>
          ) : (
            <div className="transactions-list">
              {upcomingTransactions.map((transaction) => {
                const dueBadge = getDueBadge(transaction.daysUntilDue);
                const validation = validateRecurringTransaction(transaction);
                
                return (
                  <div
                    key={transaction.id}
                    className={`transaction-item ${transaction.daysUntilDue <= 0 ? 'overdue' : ''}`}
                  >
                    <div className="transaction-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => toggleTransactionSelection(transaction.id)}
                        disabled={!validation.isValid}
                      />
                    </div>
                    
                    <div className="transaction-content">
                      <div className="transaction-main">
                        <h4 className="transaction-title">{transaction.description}</h4>
                        <p className="transaction-details">
                          {transaction.frequency} • {transaction.category}
                        </p>
                        {!validation.isValid && (
                          <div className="validation-errors">
                            {validation.errors.map((error, index) => (
                              <span key={index} className="error-text">⚠️ {error}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="transaction-info">
                        <div className="transaction-amount">
                          <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </div>
                        <div className="transaction-due">
                          <span className={`due-badge ${dueBadge.class}`}>
                            {dueBadge.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Processing Settings */}
      <div className="settings-section mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Processing Settings</h3>
          
          {/* Basic Settings */}
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Enable Auto-Processing</label>
                <p className="setting-description">Automatically process due recurring transactions</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Require Confirmation</label>
                <p className="setting-description">Show notification before processing transactions</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.requireConfirmation}
                    onChange={(e) => handleSettingsChange('requireConfirmation', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Auto-Process Income</label>
                <p className="setting-description">Automatically process income transactions</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.autoProcessIncome}
                    onChange={(e) => handleSettingsChange('autoProcessIncome', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Auto-Process Expenses</label>
                <p className="setting-description">Automatically process expense transactions</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.autoProcessExpenses}
                    onChange={(e) => handleSettingsChange('autoProcessExpenses', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Maximum Amount</label>
                <p className="setting-description">Maximum amount to auto-process (₹)</p>
              </div>
              <div className="setting-control">
                <input
                  type="number"
                  value={settings.maxAmount}
                  onChange={(e) => handleSettingsChange('maxAmount', parseFloat(e.target.value))}
                  className="form-input"
                  min="0"
                  step="100"
                />
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Processing Time</label>
                <p className="setting-description">Time of day to process transactions (24-hour format)</p>
              </div>
              <div className="setting-control">
                <input
                  type="time"
                  value={settings.processingTime}
                  onChange={(e) => handleSettingsChange('processingTime', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="advanced-settings mt-6">
              <h4 className="text-md font-semibold mb-4">Advanced Settings</h4>
              
              <div className="settings-grid">
                <div className="setting-item">
                  <div className="setting-info">
                    <label className="setting-label">Notify Before Processing</label>
                    <p className="setting-description">Send notification before processing</p>
                  </div>
                  <div className="setting-control">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifyBeforeProcessing}
                        onChange={(e) => handleSettingsChange('notifyBeforeProcessing', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label className="setting-label">Notify After Processing</label>
                    <p className="setting-description">Send notification after processing</p>
                  </div>
                  <div className="setting-control">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifyAfterProcessing}
                        onChange={(e) => handleSettingsChange('notifyAfterProcessing', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label className="setting-label">Weekends Only</label>
                    <p className="setting-description">Only process on weekends</p>
                  </div>
                  <div className="setting-control">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.weekendsOnly}
                        onChange={(e) => handleSettingsChange('weekendsOnly', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label className="setting-label">Skip Holidays</label>
                    <p className="setting-description">Skip processing on holidays</p>
                  </div>
                  <div className="setting-control">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.skipHolidays}
                        onChange={(e) => handleSettingsChange('skipHolidays', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Excluded Categories */}
              <div className="excluded-categories mt-4">
                <h5 className="text-sm font-semibold mb-2">Excluded Categories</h5>
                <p className="text-sm text-gray-600 mb-2">Categories that will never be auto-processed</p>
                <div className="categories-list">
                  {settings.excludeCategories.map((category, index) => (
                    <div key={index} className="category-tag">
                      <span>{category}</span>
                      <button
                        onClick={() => handleArraySettingChange('excludeCategories', category, 'remove')}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add category to exclude"
                  className="form-input mt-2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleArraySettingChange('excludeCategories', e.target.value.trim(), 'add');
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Processing History */}
      <div className="history-section">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Processing History</h3>
          
          {processingHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h4>No Processing History</h4>
              <p>Processed transactions will appear here</p>
            </div>
          ) : (
            <div className="history-list">
              {processingHistory.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-header">
                    <h4 className="recurring-title">{item.recurring.description}</h4>
                    <span className="process-count">
                      {item.recurring.processCount || 0} times processed
                    </span>
                  </div>
                  
                  {item.history.length > 0 && (
                    <div className="history-transactions">
                      {item.history.map((transaction) => (
                        <div key={transaction.id} className="history-transaction">
                          <span className="transaction-date">
                            {formatDate(transaction.date)}
                          </span>
                          <span className="transaction-amount">
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoProcessingManager;