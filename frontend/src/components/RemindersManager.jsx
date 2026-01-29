import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/storage';
import { 
  getReminders, 
  addReminder, 
  updateReminder, 
  deleteReminder,
  checkOverdueBudgets,
  checkDueBills,
  checkRecurringDue 
} from '../utils/remindersUtils';
import ConfirmDialog from './ConfirmDialog';

const RemindersManager = ({ transactions, budgets, recurringTransactions }) => {
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [smartAlerts, setSmartAlerts] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ show: false, id: null });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    reminderDate: '',
    amount: '',
    category: '',
    type: 'bill', // bill, budget, recurring, custom
    isRecurring: false,
    frequency: 'monthly',
    status: 'active'
  });

  useEffect(() => {
    loadReminders();
    generateSmartAlerts();
  }, [transactions, budgets, recurringTransactions]);

  const loadReminders = () => {
    const savedReminders = getReminders();
    setReminders(savedReminders);
  };

  const generateSmartAlerts = () => {
    const alerts = [];
    
    // Check for budget overruns
    const budgetAlerts = checkOverdueBudgets(transactions, budgets);
    alerts.push(...budgetAlerts);
    
    // Check for due bills
    const billAlerts = checkDueBills(reminders);
    alerts.push(...billAlerts);
    
    // Check for recurring transactions due
    const recurringAlerts = checkRecurringDue(recurringTransactions);
    alerts.push(...recurringAlerts);
    
    setSmartAlerts(alerts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingReminder) {
        const success = updateReminder(editingReminder.id, formData);
        if (success) {
          loadReminders();
          closeForm();
        }
      } else {
        const newReminder = addReminder(formData);
        if (newReminder) {
          loadReminders();
          closeForm();
        }
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  const handleDelete = (id) => {
    setDeleteDialog({ show: true, id });
  };

  const confirmDelete = () => {
    if (deleteDialog.id) {
      const success = deleteReminder(deleteDialog.id);
      if (success) {
        loadReminders();
      }
    }
    setDeleteDialog({ show: false, id: null });
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      dueDate: reminder.dueDate.split('T')[0],
      reminderDate: reminder.reminderDate.split('T')[0],
      amount: reminder.amount || '',
      category: reminder.category || '',
      type: reminder.type,
      isRecurring: reminder.isRecurring || false,
      frequency: reminder.frequency || 'monthly',
      status: reminder.status
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingReminder(null);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      reminderDate: '',
      amount: '',
      category: '',
      type: 'bill',
      isRecurring: false,
      frequency: 'monthly',
      status: 'active'
    });
  };

  const markAsCompleted = (id) => {
    const success = updateReminder(id, { status: 'completed' });
    if (success) {
      loadReminders();
    }
  };

  const snoozeReminder = (id, days = 1) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      const newDate = new Date(reminder.reminderDate);
      newDate.setDate(newDate.getDate() + days);
      
      const success = updateReminder(id, { 
        reminderDate: newDate.toISOString(),
        snoozedUntil: newDate.toISOString()
      });
      if (success) {
        loadReminders();
      }
    }
  };

  const getRemindersByStatus = (status) => {
    return reminders.filter(r => r.status === status);
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    return reminders.filter(r => {
      const reminderDate = new Date(r.reminderDate);
      return r.status === 'active' && reminderDate >= now && reminderDate <= nextWeek;
    });
  };

  const getOverdueReminders = () => {
    const now = new Date();
    return reminders.filter(r => {
      const reminderDate = new Date(r.reminderDate);
      return r.status === 'active' && reminderDate < now;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dateString) => {
    const now = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const activeReminders = getRemindersByStatus('active');
  const completedReminders = getRemindersByStatus('completed');
  const upcomingReminders = getUpcomingReminders();
  const overdueReminders = getOverdueReminders();

  return (
    <div className="reminders-manager">
      <div className="reminders-header">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Smart Reminders & Alerts</h2>
            <p className="text-gray-600 mt-1">Manage bills, budgets, and payment reminders</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            + Add Reminder
          </button>
        </div>

        {/* Smart Alerts Section */}
        {smartAlerts.length > 0 && (
          <div className="smart-alerts mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              🚨 Smart Alerts
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {smartAlerts.length}
              </span>
            </h3>
            <div className="alerts-grid">
              {smartAlerts.map((alert, index) => (
                <div key={index} className={`alert-card alert-${alert.priority}`}>
                  <div className="alert-icon">{alert.icon}</div>
                  <div className="alert-content">
                    <h4 className="alert-title">{alert.title}</h4>
                    <p className="alert-message">{alert.message}</p>
                    {alert.amount && (
                      <p className="alert-amount">{formatCurrency(alert.amount)}</p>
                    )}
                  </div>
                  <div className="alert-actions">
                    {alert.action && (
                      <button className="btn btn-sm btn-secondary">
                        {alert.action}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="reminders-stats mb-6">
          <div className="stats-grid">
            <div className="stat-card overdue">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h3>Overdue</h3>
                <p className="stat-number">{overdueReminders.length}</p>
              </div>
            </div>
            <div className="stat-card upcoming">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <h3>This Week</h3>
                <p className="stat-number">{upcomingReminders.length}</p>
              </div>
            </div>
            <div className="stat-card active">
              <div className="stat-icon">🔔</div>
              <div className="stat-info">
                <h3>Active</h3>
                <p className="stat-number">{activeReminders.length}</p>
              </div>
            </div>
            <div className="stat-card completed">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Completed</h3>
                <p className="stat-number">{completedReminders.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <div className="reminders-section overdue-section mb-6">
          <h3 className="section-title">⚠️ Overdue Reminders</h3>
          <div className="reminders-list">
            {overdueReminders.map((reminder) => {
              const daysOverdue = Math.abs(getDaysUntilDue(reminder.reminderDate));
              return (
                <div key={reminder.id} className="reminder-card overdue">
                  <div className="reminder-content">
                    <div className="reminder-main">
                      <h4 className="reminder-title">{reminder.title}</h4>
                      <p className="reminder-description">{reminder.description}</p>
                      <div className="reminder-meta">
                        <span className="reminder-type">{reminder.type}</span>
                        <span className="reminder-overdue">
                          {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                        </span>
                      </div>
                    </div>
                    <div className="reminder-details">
                      <p className="reminder-due-date">
                        Due: {formatDate(reminder.dueDate)}
                      </p>
                      {reminder.amount && (
                        <p className="reminder-amount">{formatCurrency(reminder.amount)}</p>
                      )}
                    </div>
                  </div>
                  <div className="reminder-actions">
                    <button
                      onClick={() => markAsCompleted(reminder.id)}
                      className="btn btn-sm btn-success"
                      title="Mark as completed"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => snoozeReminder(reminder.id, 1)}
                      className="btn btn-sm btn-secondary"
                      title="Snooze for 1 day"
                    >
                      😴
                    </button>
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="btn btn-sm btn-secondary"
                      title="Edit reminder"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="reminders-section upcoming-section mb-6">
          <h3 className="section-title">📅 This Week</h3>
          <div className="reminders-list">
            {upcomingReminders.map((reminder) => {
              const daysUntil = getDaysUntilDue(reminder.reminderDate);
              return (
                <div key={reminder.id} className="reminder-card upcoming">
                  <div className="reminder-content">
                    <div className="reminder-main">
                      <h4 className="reminder-title">{reminder.title}</h4>
                      <p className="reminder-description">{reminder.description}</p>
                      <div className="reminder-meta">
                        <span className="reminder-type">{reminder.type}</span>
                        <span className={`reminder-due-in ${daysUntil <= 2 ? 'urgent' : ''}`}>
                          {daysUntil === 0 ? 'Due today' : 
                           daysUntil === 1 ? 'Due tomorrow' : 
                           `Due in ${daysUntil} days`}
                        </span>
                      </div>
                    </div>
                    <div className="reminder-details">
                      <p className="reminder-due-date">
                        Due: {formatDate(reminder.dueDate)}
                      </p>
                      {reminder.amount && (
                        <p className="reminder-amount">{formatCurrency(reminder.amount)}</p>
                      )}
                    </div>
                  </div>
                  <div className="reminder-actions">
                    <button
                      onClick={() => markAsCompleted(reminder.id)}
                      className="btn btn-sm btn-success"
                      title="Mark as completed"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="btn btn-sm btn-secondary"
                      title="Edit reminder"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Active Reminders */}
      <div className="reminders-section active-section">
        <h3 className="section-title">🔔 All Active Reminders</h3>
        {activeReminders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h4>No active reminders</h4>
            <p>Create your first reminder to get started with smart alerts</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              Add Reminder
            </button>
          </div>
        ) : (
          <div className="reminders-list">
            {activeReminders.map((reminder) => (
              <div key={reminder.id} className="reminder-card active">
                <div className="reminder-content">
                  <div className="reminder-main">
                    <h4 className="reminder-title">{reminder.title}</h4>
                    <p className="reminder-description">{reminder.description}</p>
                    <div className="reminder-meta">
                      <span className="reminder-type">{reminder.type}</span>
                      {reminder.isRecurring && (
                        <span className="reminder-recurring">🔄 {reminder.frequency}</span>
                      )}
                    </div>
                  </div>
                  <div className="reminder-details">
                    <p className="reminder-due-date">
                      Due: {formatDate(reminder.dueDate)}
                    </p>
                    {reminder.amount && (
                      <p className="reminder-amount">{formatCurrency(reminder.amount)}</p>
                    )}
                  </div>
                </div>
                <div className="reminder-actions">
                  <button
                    onClick={() => markAsCompleted(reminder.id)}
                    className="btn btn-sm btn-success"
                    title="Mark as completed"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handleEdit(reminder)}
                    className="btn btn-sm btn-secondary"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="btn btn-sm btn-danger"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reminder Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && closeForm()}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingReminder ? 'Edit Reminder' : 'Add New Reminder'}</h2>
              <button className="close-btn" onClick={closeForm}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="reminder-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Reminder Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="form-select"
                    required
                  >
                    <option value="bill">Bill Payment</option>
                    <option value="budget">Budget Alert</option>
                    <option value="recurring">Recurring Transaction</option>
                    <option value="custom">Custom Reminder</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input"
                  placeholder="Enter reminder title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="form-input"
                  rows="3"
                  placeholder="Enter reminder description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dueDate" className="form-label">Due Date</label>
                  <input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reminderDate" className="form-label">Reminder Date</label>
                  <input
                    id="reminderDate"
                    type="date"
                    value={formData.reminderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderDate: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount" className="form-label">Amount (Optional)</label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="form-input"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category (Optional)</label>
                  <input
                    id="category"
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="form-input"
                    placeholder="e.g., Utilities, Rent"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  />
                  <span className="checkbox-text">This is a recurring reminder</span>
                </label>
              </div>

              {formData.isRecurring && (
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                    className="form-select"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={closeForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingReminder ? 'Update Reminder' : 'Add Reminder'}
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
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default RemindersManager;