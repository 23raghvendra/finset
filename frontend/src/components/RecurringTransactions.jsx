import React, { useState } from 'react';
import { useAdvancedFinance } from '../hooks/useAdvancedFinance';
import { getCategories, formatCurrency } from '../utils/storage';
import ConfirmDialog from './ConfirmDialog';

const RecurringTransactions = () => {
  const {
    recurringTransactions,
    createRecurringTransaction,
    editRecurringTransaction,
    removeRecurringTransaction,
    getDueRecurringTransactions
  } = useAdvancedFinance();

  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [categories] = useState(() => getCategories());
  const [deleteDialog, setDeleteDialog] = useState({ show: false, id: null });

  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    description: '',
    amount: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true
  });

  const dueTransactions = getDueRecurringTransactions();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const recurringData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    let success = false;
    if (editingRecurring) {
      success = editRecurringTransaction(editingRecurring.id, recurringData);
    } else {
      success = createRecurringTransaction(recurringData);
    }

    if (success) {
      setFormData({
        type: 'expense',
        category: '',
        description: '',
        amount: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isActive: true
      });
      setShowRecurringForm(false);
      setEditingRecurring(null);
    }
  };

  const handleEdit = (recurring) => {
    setEditingRecurring(recurring);
    setFormData({
      type: recurring.type,
      category: recurring.category,
      description: recurring.description,
      amount: recurring.amount.toString(),
      frequency: recurring.frequency,
      startDate: new Date(recurring.startDate).toISOString().split('T')[0],
      endDate: recurring.endDate ? new Date(recurring.endDate).toISOString().split('T')[0] : '',
      isActive: recurring.isActive
    });
    setShowRecurringForm(true);
  };

  const handleDelete = (id) => {
    setDeleteDialog({ show: true, id });
  };

  const confirmDelete = () => {
    if (deleteDialog.id) {
      removeRecurringTransaction(deleteDialog.id);
    }
    setDeleteDialog({ show: false, id: null });
  };

  const getNextDueDate = (recurring) => {
    return new Date(recurring.nextDueDate).toLocaleDateString();
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    };
    return labels[frequency] || frequency;
  };

  const currentCategories = categories[formData.type] || [];

  return (
    <div className="recurring-transactions">
      <div className="section-header">
        <div>
          <h2>🔄 Recurring Transactions</h2>
          <p className="text-secondary">Manage your recurring income and expenses</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowRecurringForm(true)}
        >
          + Add Recurring Transaction
        </button>
      </div>

      {/* Due Transactions Alert */}
      {dueTransactions.length > 0 && (
        <div className="alerts-section">
          <div className="alert alert-warning">
            <div className="alert-icon">⏰</div>
            <div className="alert-content">
              <div className="alert-message">
                You have {dueTransactions.length} recurring transaction{dueTransactions.length > 1 ? 's' : ''} due
              </div>
              <p className="alert-details">
                Check the due transactions below and process them manually or set up automatic processing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Due Transactions List */}
      {dueTransactions.length > 0 && (
        <div className="card mb-6">
          <h3>⏰ Due Transactions</h3>
          <div className="due-transactions-list">
            {dueTransactions.map((recurring) => (
              <div key={recurring.id} className="due-transaction-item">
                <div className="transaction-info">
                  <div className="transaction-main">
                    <span className="transaction-icon">
                      {recurring.type === 'income' ? '📈' : '📉'}
                    </span>
                    <div>
                      <p className="transaction-description">{recurring.description}</p>
                      <p className="transaction-category">{recurring.category}</p>
                    </div>
                  </div>
                  <div className="transaction-details">
                    <p className={`transaction-amount ${
                      recurring.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(recurring.amount)}
                    </p>
                    <p className="transaction-frequency">{getFrequencyLabel(recurring.frequency)}</p>
                  </div>
                </div>
                <div className="due-actions">
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => {
                      // TODO: Process this recurring transaction
                      console.log('Process recurring transaction:', recurring);
                    }}
                  >
                    Process Now
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      // TODO: Skip this occurrence
                      console.log('Skip recurring transaction:', recurring);
                    }}
                  >
                    Skip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recurring Transactions List */}
      <div className="recurring-grid">
        {recurringTransactions.length > 0 ? (
          recurringTransactions.map((recurring) => (
            <div key={recurring.id} className="recurring-card card">
              <div className="recurring-header">
                <div className="recurring-type">
                  <span className="type-icon">
                    {recurring.type === 'income' ? '💰' : '💸'}
                  </span>
                  <div>
                    <h4>{recurring.description}</h4>
                    <p className="recurring-category">{recurring.category}</p>
                  </div>
                </div>
                <div className="recurring-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEdit(recurring)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(recurring.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="recurring-details">
                <div className="detail-row">
                  <span className="detail-label">Amount:</span>
                  <span className={`detail-value ${
                    recurring.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(recurring.amount)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Frequency:</span>
                  <span className="detail-value">{getFrequencyLabel(recurring.frequency)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Next Due:</span>
                  <span className="detail-value">{getNextDueDate(recurring)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status ${recurring.isActive ? 'status-active' : 'status-inactive'}`}>
                    {recurring.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔄</div>
            <h3>No Recurring Transactions</h3>
            <p>Set up recurring transactions to automate your regular income and expenses.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowRecurringForm(true)}
            >
              Add Your First Recurring Transaction
            </button>
          </div>
        )}
      </div>

      {/* Recurring Transaction Form Modal */}
      {showRecurringForm && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowRecurringForm(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingRecurring ? 'Edit Recurring Transaction' : 'Create Recurring Transaction'}</h2>
              <button className="close-btn" onClick={() => {
                setShowRecurringForm(false);
                setEditingRecurring(null);
                setFormData({
                  type: 'expense',
                  category: '',
                  description: '',
                  amount: '',
                  frequency: 'monthly',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: '',
                  isActive: true
                });
              }}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="recurring-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Transaction Type</label>
                  <div className="type-selector">
                    <button
                      type="button"
                      className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
                    >
                      💰 Income
                    </button>
                    <button
                      type="button"
                      className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
                    >
                      💸 Expense
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="form-input"
                  placeholder="e.g., Salary, Rent Payment, Netflix Subscription"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="form-select"
                    required
                  >
                    <option value="">Select a category</option>
                    {currentCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="form-input"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                    className="form-select"
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="form-input"
                  min={formData.startDate}
                />
                <small className="form-help">Leave blank for no end date</small>
              </div>

              <div className="form-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <span className="checkmark"></span>
                  Active (will generate transactions automatically)
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecurringForm(false);
                    setEditingRecurring(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  {editingRecurring ? 'Update Recurring Transaction' : 'Create Recurring Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.show}
        onClose={() => setDeleteDialog({ show: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Recurring Transaction"
        message="Are you sure you want to delete this recurring transaction? Future occurrences will no longer be generated."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default RecurringTransactions;