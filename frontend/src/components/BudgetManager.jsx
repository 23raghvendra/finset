import React, { useState } from 'react';
import { useAdvancedFinance } from '../hooks/useAdvancedFinance';
import { getCategories, formatCurrency } from '../utils/storage';
import { Plus, AlertTriangle, Edit2, Trash2, Target, X } from 'lucide-react';
import SavingsGoals from './SavingsGoals';
import ConfirmDialog from './ConfirmDialog';

const BudgetManager = ({ transactions }) => {
  const {
    budgets,
    createBudget,
    editBudget,
    removeBudget,
    checkBudgetAlerts
  } = useAdvancedFinance();

  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [categories] = useState(() => getCategories());
  const [deleteDialog, setDeleteDialog] = useState({ show: false, budget: null });

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    alertThreshold: 80
  });

  const budgetAlerts = checkBudgetAlerts(transactions);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.amount || parseFloat(formData.amount) <= 0) {
      return;
    }

    const now = new Date();
    let startDate, endDate;

    if (formData.period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (formData.period === 'weekly') {
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (formData.period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    const budgetData = {
      ...formData,
      amount: parseFloat(formData.amount),
      alertThreshold: parseInt(formData.alertThreshold),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    if (editingBudget) {
      await editBudget(editingBudget._id || editingBudget.id, budgetData);
    } else {
      await createBudget(budgetData);
    }

    setFormData({ category: '', amount: '', period: 'monthly', alertThreshold: 80 });
    setShowBudgetForm(false);
    setEditingBudget(null);
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
      alertThreshold: budget.alertThreshold || 80
    });
    setShowBudgetForm(true);
  };

  const handleDelete = (budget) => {
    setDeleteDialog({ show: true, budget });
  };

  const confirmDelete = async () => {
    if (deleteDialog.budget) {
      await removeBudget(deleteDialog.budget._id || deleteDialog.budget.id);
    }
    setDeleteDialog({ show: false, budget: null });
  };

  const getSpent = (budget) => budget.spent !== undefined ? budget.spent : 0;
  const getPercentage = (budget) => {
    if (budget.percentage !== undefined) return budget.percentage;
    return (getSpent(budget) / budget.amount) * 100;
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Budget</h1>
            <p className="text-secondary text-sm">Manage your spending limits</p>
          </div>
          <button
            onClick={() => setShowBudgetForm(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            New Budget
          </button>
        </div>

        {/* Alerts */}
        {budgetAlerts.length > 0 && (
          <div className="bg-elevated border border-default rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-primary text-sm">Budget Alerts</p>
              {budgetAlerts.map((alert, i) => (
                <p key={i} className="text-secondary text-sm">{alert.category}: {alert.message}</p>
              ))}
            </div>
          </div>
        )}

        {/* Budgets Grid */}
        <div className="grid grid-cols-3 gap-4">
          {budgets.map((budget) => {
            const spent = getSpent(budget);
            const percentage = getPercentage(budget);
            const remaining = budget.amount - spent;
            const isOver = percentage >= 100;
            const isNear = percentage >= 80;

            return (
              <div
                key={budget._id || budget.id}
                className="bg-surface rounded-2xl p-5 border border-default transition-all hover:border-[var(--accent)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-primary">{budget.category}</h3>
                    <p className="text-xs text-muted uppercase">{budget.period}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(budget)} className="p-1.5 hover:bg-elevated rounded-lg text-muted hover:text-primary transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(budget)} className="p-1.5 hover:bg-elevated rounded-lg text-muted hover:text-primary transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-end justify-between mb-2">
                    <p className="text-2xl font-bold text-primary">{formatCurrency(spent)}</p>
                    <p className="text-sm text-secondary">of {formatCurrency(budget.amount)}</p>
                  </div>
                  <div className="w-full h-1.5 bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        background: 'var(--accent)'
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Remaining</span>
                  <span className="font-medium text-primary">
                    {formatCurrency(Math.max(0, remaining))}
                  </span>
                </div>
              </div>
            );
          })}

          {budgets.length === 0 && (
            <div className="col-span-3 bg-surface rounded-2xl p-12 border border-dashed border-default text-center">
              <Target className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-primary mb-1">No budgets yet</h3>
              <p className="text-secondary text-sm mb-4">Create your first budget to track spending</p>
              <button onClick={() => setShowBudgetForm(true)} className="btn btn-primary">
                Create Budget
              </button>
            </div>
          )}
        </div>

        {/* Savings Goals */}
        <SavingsGoals />

        {/* Budget Form Modal */}
        {showBudgetForm && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowBudgetForm(false)}>
            <div className="modal-content p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">
                  {editingBudget ? 'Edit Budget' : 'New Budget'}
                </h2>
                <button onClick={() => setShowBudgetForm(false)} className="text-muted hover:text-primary">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Category <span style={{ color: 'var(--danger-500)' }}>*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.expense.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Amount <span style={{ color: 'var(--danger-500)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="input"
                      placeholder="₹10,000"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Period <span style={{ color: 'var(--danger-500)' }}>*</span>
                    </label>
                    <select
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      className="input"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowBudgetForm(false)} className="btn btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingBudget ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.show}
          onClose={() => setDeleteDialog({ show: false, budget: null })}
          onConfirm={confirmDelete}
          title="Delete Budget"
          message={`Are you sure you want to delete the budget for "${deleteDialog.budget?.category}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};

export default BudgetManager;
