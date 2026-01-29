import React, { useState } from 'react';
import Header from '../components/Header';
import { formatINR, getCategories } from '../utils/storage';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Plus,
  Edit2,
  X,
  Check,
  AlertCircle,
  Trash2
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

const BudgetPage = ({ user, budgets, transactions, createBudget, editBudget, removeBudget }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteBudgetConfirm, setDeleteBudgetConfirm] = useState({ show: false, budget: null });
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
  });

  const categories = getCategories();

  // Calculate totals
  const totalBudget = budgets?.reduce((acc, b) => acc + b.amount, 0) || 0;
  const totalSpent = budgets?.reduce((acc, b) => acc + (b.spent || 0), 0) || 0;
  const remaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Most expenses by category
  const expensesByCategory = transactions
    ?.filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const topExpenses = Object.entries(expensesByCategory || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date();
    let startDate, endDate;

    if (formData.period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (formData.period === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    }

    const budgetData = {
      category: formData.category,
      amount: parseFloat(formData.amount),
      period: formData.period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    if (editingBudget) {
      await editBudget(editingBudget._id || editingBudget.id, budgetData);
    } else {
      await createBudget(budgetData);
    }

    setFormData({ category: '', amount: '', period: 'monthly' });
    setShowForm(false);
    setEditingBudget(null);
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period || 'monthly',
    });
    setShowForm(true);
  };

  const confirmDeleteBudget = async () => {
    if (deleteBudgetConfirm.budget) {
      const id = deleteBudgetConfirm.budget._id || deleteBudgetConfirm.budget.id;
      await removeBudget(id);
      setDeleteBudgetConfirm({ show: false, budget: null });
    }
  };

  const getSpent = (budget) => budget.spent || 0;
  const getPercentage = (budget) => {
    const spent = getSpent(budget);
    return budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  };

  const getBudgetStatus = (percentage) => {
    if (percentage >= 90) return { text: 'need attention', color: 'var(--warning-500)', bg: 'var(--warning-200)' };
    return { text: 'on track', color: 'var(--success-800)', bg: 'var(--success-200)' };
  };

  // Pie chart data
  const pieData = [
    { name: 'Spent', value: spentPercentage },
    { name: 'Remaining', value: 100 - spentPercentage },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <Header 
        title="Budget"
        subtitle="Create and track your budgets"
        user={user}
      >
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Add new budget
        </button>
      </Header>

      <p className="text-sm text-[var(--neutral-400)] mb-4">{budgets?.length || 0} budgets</p>

      <div className="grid grid-cols-3 gap-4">
        {/* Budget Cards */}
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-4">
            {budgets?.map((budget) => {
              const spent = getSpent(budget);
              const budgetRemaining = budget.amount - spent;
              const percentage = getPercentage(budget);
              const status = getBudgetStatus(percentage);

              return (
                <div key={budget._id || budget.id} className="card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-[var(--neutral-900)]">{budget.category}</h3>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => handleEdit(budget)} className="p-2 hover:bg-[var(--neutral-100)] rounded-lg" title="Edit budget">
                        <Edit2 size={16} className="text-[var(--neutral-400)]" />
                      </button>
                      <button type="button" onClick={() => setDeleteBudgetConfirm({ show: true, budget })} className="p-2 hover:bg-[var(--danger-100)] rounded-lg" title="Delete budget">
                        <Trash2 size={16} className="text-[var(--danger-500)]" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-4">
                    {/* Circular Progress */}
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke="var(--neutral-100)"
                          strokeWidth="6"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke="var(--primary-600)"
                          strokeWidth="6"
                          strokeDasharray={`${percentage * 2.2} ${220 - percentage * 2.2}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-xs text-[var(--neutral-400)]">{Math.round(percentage)}% spent</span>
                        <span className="text-sm font-bold text-[var(--neutral-900)]">{formatINR(spent)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--neutral-400)] mb-1">Left</p>
                      <p className="text-2xl font-bold text-[var(--neutral-900)]">
                        {formatINR(budgetRemaining > 0 ? budgetRemaining : 0)}
                        <span className="text-sm font-normal text-[var(--neutral-400)]"> / {formatINR(budget.amount)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs" style={{ color: status.color }}>
                    {percentage < 90 ? <Check size={14} /> : <AlertCircle size={14} />}
                    <span>{status.text}</span>
                  </div>
                </div>
              );
            })}

            {(!budgets || budgets.length === 0) && (
              <div className="col-span-2 card p-12 text-center">
                <p className="text-[var(--neutral-400)]">No budgets yet. Create your first budget!</p>
                <button className="btn btn-primary mt-4" onClick={() => setShowForm(true)}>
                  <Plus size={16} />
                  Add Budget
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Monthly Budget Summary */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--neutral-900)]">Monthly Budget</h3>
            </div>
            <p className="text-3xl font-bold text-[var(--neutral-900)] mb-4">
              {formatINR(totalBudget)}
            </p>

            <div className="relative w-40 h-40 mx-auto mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="var(--primary-600)" />
                    <Cell fill="var(--neutral-100)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xs text-[var(--neutral-400)]">{Math.round(spentPercentage)}% spent</span>
                <span className="text-lg font-bold text-[var(--neutral-900)]">{formatINR(totalSpent)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--neutral-400)]">{Math.round(100 - spentPercentage)}% left</span>
              <span className="font-medium text-[var(--neutral-900)]">{formatINR(remaining > 0 ? remaining : 0)}</span>
            </div>
          </div>

          {/* Most Expenses */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--neutral-900)]">Top Expenses</h3>
            </div>
            <div className="space-y-3">
              {topExpenses.map(([category, amount], i) => (
                <div key={category} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--neutral-100)] flex items-center justify-center">
                    <span className="text-xs">{category.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--neutral-900)]">{formatINR(amount)}</p>
                    <p className="text-xs text-[var(--neutral-400)]">{category}</p>
                  </div>
                </div>
              ))}
              {topExpenses.length === 0 && (
                <p className="text-sm text-[var(--neutral-400)] text-center py-4">No expenses yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--neutral-900)]">
                {editingBudget ? 'Edit Budget' : 'Add New Budget'}
              </h2>
              <button type="button" onClick={() => { setShowForm(false); setEditingBudget(null); }} className="text-[var(--neutral-400)] hover:text-[var(--neutral-600)]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.expense.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Amount</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input"
                    placeholder="₹0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Period</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="input"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingBudget ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Budget Confirmation */}
      <ConfirmDialog
        isOpen={deleteBudgetConfirm.show}
        onClose={() => setDeleteBudgetConfirm({ show: false, budget: null })}
        onConfirm={confirmDeleteBudget}
        title="Delete Budget"
        message={deleteBudgetConfirm.budget ? `Are you sure you want to delete the budget for "${deleteBudgetConfirm.budget.category}"? This action cannot be undone.` : 'Delete this budget?'}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default BudgetPage;
